import { Boom } from '@hapi/boom';
import { Browsers, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, makeWASocket } from '@itsukichann/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import { usarAuthPostgres } from './auth.js';
import config from './config.js';
import { query } from './database.js';
import { handleMessage } from './handler.js';
import { log } from './utils.js';

class SubbotManager {
  constructor() {
    this.instances = new Map();
    this.plugins = null;
    this.keepAliveTimers = new Map();
    this.reconnectTimers = new Map();
    this.manuallyLoggedOut = new Set();
  }

  setPlugins(plugins) {
    this.plugins = plugins;
  }

  async initAll() {
    try {
      // Obtenemos todos los sub-bots registrados (sin filtrar por estado para asegurar re-conexión de todos los que tengan sesión)
      const res = await query("SELECT jid FROM subbots");
      log('INFO', `[Subbots] Re-conectando ${res.rows.length} sub-bots registrados...`);

      // Usar un pequeño delay entre conexiones para no saturar el socket de una vez
      for (const row of res.rows) {
        this.conectar(row.jid).catch(e =>
          log('ERROR', `Error reconectando subbot ${row.jid}: ${e.message}`)
        );
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (e) {
      log('ERROR', '[Subbots] Error al inicializar subbots: ' + e.message);
    }
  }

  async conectar(sesionId, m = null, usePairingCode = false, retryCount = 0, mainConn = null) {
    if (this.instances.has(sesionId)) {
      const existing = this.instances.get(sesionId);
      // Si ya está conectando o conectado y no es una solicitud forzada por mensaje (m), ignorar
      if (!m && existing?.ws?.readyState === 1) return;

      // Si existe pero queremos reconectar, cerramos lo anterior limpiamente
      try {
        existing.ev.removeAllListeners();
        existing.end();
      } catch (e) {}
    }

    // Si m es un objeto con remoteJid, lo tratamos como metadatos de respuesta
    const responseInfo = m && m.key ? { remoteJid: m.key.remoteJid, key: m.key } : (m?.remoteJid ? m : null);

    if (usePairingCode) {
      try {
        log('INFO', `[Subbot] Limpiando sesión previa para ${sesionId}...`);
        // Limpiar TODAS las llaves/credenciales de la sesión (formato correcto con subrayado)
        await query("DELETE FROM auth_keys WHERE id LIKE $1", [`${sesionId}_%`]);
      } catch (e) {
        log('ERROR', `[Subbot] Error limpiando sesión: ${e.message}`);
      }
    }

    const { state, saveCreds } = await usarAuthPostgres(sesionId);

    const maxRetries = 5;
    const retryDelay = Math.min(Math.pow(2, retryCount) * 5000, 60000);

    const { version } = await fetchLatestBaileysVersion();

    // ✅ MEJORA: Navegador Ubuntu Chrome para mayor estabilidad en Pairing
    // Se usa una versión fija y estable para evitar que WhatsApp detecte cambios constantes
    const randomBrowser = Browsers.ubuntu('Chrome');

    const conn = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      markOnlineOnConnect: true,
      browser: randomBrowser,
      generateHighQualityLinkPreview: false,
      syncFullHistory: false,
      defaultQueryTimeoutMs: 0,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 30000,
      // Reducir la frecuencia de guardado de credenciales para evitar bloqueos por I/O
      authConfig: {
        maxPreKeyFetch: 5,
        shouldSyncHistoryMessage: () => false
      },
      getMessage: async (key) => {
        return { conversation: '' };
      }
    });

    conn.isSubbot = sesionId !== 'main';
    conn.botOwner = config.ownerJid;

    if (conn.isSubbot) {
      try {
        const res = await query("SELECT jid_owner FROM subbots WHERE jid = $1", [sesionId]);
        if (res.rows[0]) conn.botOwner = res.rows[0].jid_owner;
      } catch (e) {}
    }

    conn.isSubbot = true;
    this.instances.set(sesionId, conn);

    // ─── Pairing Code ─────────────────────────────────────────────
    if (usePairingCode && !conn.authState.creds.registered) {
      const phoneNumber = sesionId.split('@')[0].replace(/\D/g, '');

      const requestPairing = async (retry = 0) => {
        if (conn._pairingRequested && retry === 0) return;
        conn._pairingRequested = true;

        try {
          // Esperar un poco a que el socket se estabilice
          await new Promise(resolve => setTimeout(resolve, 6000));

          log('INFO', `[Subbot] Intentando solicitar Pairing Code para +${phoneNumber}...`);
          const code = await conn.requestPairingCode(phoneNumber);
          log('OK', `[Subbot] Código generado para ${phoneNumber}: ${code}`);

          // Si estamos en un worker, enviamos el código al master
          if (process.send) {
            process.send({
              type: 'pairingCode',
              jid: sesionId,
              code: code,
              responseInfo: responseInfo
            });
          } else if (responseInfo && code) {
            // Si no hay worker, intentamos enviar directamente (fallback)
            const sender = mainConn || conn;
            const formatted = code.match(/.{1,4}/g)?.join('-') || code;
            await sender.sendMessage(responseInfo.remoteJid, {
              text:
                `╭┈ ↷  *『 📱 𝓒𝓸𝓭𝓲𝓰𝓸 𝓟𝓪𝓲𝓻𝓲𝓷𝓰 』*\n` +
                `│\n` +
                `│ 📲 *Número:* +${phoneNumber}\n` +
                `│ 🔑 *Código:* \`${formatted}\`\n` +
                `│\n` +
                `│ ⏰ Expira en ~60 segundos\n` +
                `│\n` +
                `│ 🌸 *Instrucciones:*\n` +
                `│  1. WhatsApp → *Dispositivos vinculados*\n` +
                `│  2. *Vincular con número de teléfono*\n` +
                `│  3. Ingresa el código de arriba\n` +
                `╰───────────────── ✨`
            }, { quoted: responseInfo.key ? { key: responseInfo.key, message: {} } : null });
          }
        } catch (e) {
          log('ERROR', `[Subbot] Pairing Code error para ${phoneNumber}: ${e.message}`);

          if (e.message?.includes('429') || e.message?.includes('limit')) {
             if (process.send) process.send({ type: 'pairingError', jid: sesionId, error: 'limit', responseInfo });
             conn._pairingRequested = false;
             return;
          }

          // Si falla por socket no listo, reintentar una vez más
          if (retry < 2) {
            log('INFO', `[Subbot] Reintentando Pairing Code en 5s... (${retry + 1}/2)`);
            setTimeout(() => requestPairing(retry + 1), 5000);
          } else {
            conn._pairingRequested = false;
          }
        }
      };

      // Intentar pedir el código cuando cambie el estado
      const pairingListener = (update) => {
        const { connection, qr } = update;
        if (connection === 'connecting' || qr) {
          requestPairing();
        }
      };
      conn.ev.on('connection.update', pairingListener);

      // También intentar inmediatamente por si el evento ya pasó
      requestPairing();
    }

    // ─── Eventos generales ────────────────────────────────────────
    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // QR solo si NO es pairing code
      if (qr && m && !usePairingCode) {
        try {
          const qrBuffer = await QRCode.toBuffer(qr, { scale: 8 });
          const sender = mainConn || conn;
          await sender.sendMessage(m.key.remoteJid, {
            image: qrBuffer,
            caption:
              `☁️ *KIRBY SUB-BOT: QR*\n\n` +
              `╰╮ Escanea este QR para vincularte.\n` +
              `╭╯ *Vence en:* 20 segundos.\n\n` +
              `✨ *Dream Bot System*`
          }, { quoted: m });
        } catch (e) {
          log('ERROR', '[Subbot] Error enviando QR: ' + e.message);
        }
      }

      // Conexión abierta
      if (connection === 'open') {
        const jid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        const lid = conn.user.lid || jid;
        log('OK', `[Subbot] Conectado: ${jid} (LID: ${lid.split('@')[0]})`);
        let shouldWelcome = false;
        try {
          const r = await query("SELECT bienvenida_enviada FROM subbots WHERE jid = $1", [jid]);
          shouldWelcome = !r.rows[0]?.bienvenida_enviada;
        } catch (_) {}

        const sender = mainConn || conn;
        if (m && shouldWelcome) {
          const prefijo = conn.isSubbot ? '.' : config.prefijo;
          await sender.sendMessage(m.key.remoteJid, {
            text:
              `╭ ꒰ 🌈 *¡𝓑𝓲𝓮𝓷𝓿𝓮𝓷𝓲𝓭𝓸 𝓪 𝓓𝓻𝓮𝓪𝓶𝓵𝓪𝓷𝓭!* 🌈 ꒱\n` +
              `┊\n` +
              `┊ ✨ *Bot:* ${conn.user.name || 'Kirby Bot'}\n` +
              `┊ ☁️ *JID:* ${jid}\n` +
              `┊ 💠 *LID:* ${lid.split('@')[0]}\n` +
              `┊\n` +
              `┊ 🌸 *¡Ya eres un Sub-Bot oficial!*\n` +
              `┊ Usa el prefijo *${prefijo}* para divertirte poyo!\n` +
              `╰━━━━━━━━━━━━━━━━━ ✨`
          }, { quoted: m });
        }

        if (shouldWelcome) {
          try {
            const ownerWelcomeSender = mainConn || conn;
            const prefijoUso = conn.isSubbot ? '.' : config.prefijo;
            await ownerWelcomeSender.sendMessage(conn.botOwner || config.ownerJid, {
              text:
                `✩ 𝘚𝘶𝘣-𝘉𝘰𝘵 𝘤𝘰𝘯𝘦𝘤𝘵𝘢𝘥𝘰 ✩\n\n` +
                `• Nombre: ${conn.user.name || 'Kirby Bot'}\n` +
                `• JID: ${jid}\n` +
                `• LID: ${lid.split('@')[0]}\n\n` +
                `¡Bienvenido a Dreamland!\n` +
                `Usa el prefijo “${prefijoUso}” en esa cuenta para ejecutar comandos.`
            });
          } catch (_) {}
        }

        const ownerToSave = responseInfo?.ownerJid || conn.botOwner || config.ownerJid;
        await query(
          `INSERT INTO subbots (jid, jid_owner, estado) VALUES ($1, $2, $3)
           ON CONFLICT (jid) DO UPDATE SET estado = $3`,
          [jid, ownerToSave, 'conectado']
        );

        // Guardar credenciales finales inmediatamente para evitar pérdidas post-pairing
        try {
          await saveCreds();
        } catch (e) {}

        // Iniciar KeepAlive para prolongar la sesión
        try {
          const timer = setInterval(async () => {
            try {
              await conn.sendPresenceUpdate('available');
              await saveCreds();
            } catch (_) {}
          }, 60000); // cada 1 minuto
          this.keepAliveTimers.set(sesionId, timer);
        } catch (_) {}

        if (shouldWelcome) {
          try {
            await query("UPDATE subbots SET bienvenida_enviada = true WHERE jid = $1", [jid]);
          } catch (_) {}
        }
      }

      // Conexión cerrada
      if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        const reasonStr = (lastDisconnect?.error?.output?.payload?.message || lastDisconnect?.error?.message || '').toString();
        log('WARN', `[Subbot] Desconectado (${sesionId}). Código: ${reason} - ${reasonStr}`);

        // Detener KeepAlive si existía
        const ka = this.keepAliveTimers.get(sesionId);
        if (ka) {
          clearInterval(ka);
          this.keepAliveTimers.delete(sesionId);
        }

        // Cancelar reconexión planificada si hay una previa
        const scheduled = this.reconnectTimers.get(sesionId);
        if (scheduled) {
          clearTimeout(scheduled);
          this.reconnectTimers.delete(sesionId);
        }

        // Si el cierre fue consiguiente de logout manual, no reconectar
        if (this.manuallyLoggedOut.has(sesionId)) {
          log('INFO', `[Subbot] Logout manual detectado para ${sesionId}; no se reintentará.`);
          this.manuallyLoggedOut.delete(sesionId);
          conn.ev.removeAllListeners();
          this.instances.delete(sesionId);
          await query("UPDATE subbots SET estado = 'desconectado' WHERE jid = $1", [sesionId]);
          return;
        }

        // Errores permanentes (session invalidada)
        const isPermanent = reason === DisconnectReason.loggedOut || reason === DisconnectReason.badSession || reason === 401;

        if (isPermanent) {
          log('ERROR', `[Subbot] Sesión expirada para ${sesionId}. Limpiando...`);
          conn.ev.removeAllListeners();
          this.instances.delete(sesionId);
          await query("DELETE FROM auth_keys WHERE id LIKE $1", [`${sesionId}%`]);
          await query("UPDATE subbots SET estado = 'desconectado' WHERE jid = $1", [sesionId]);

          // Notificar al proceso principal para que mensaje al dueño del sub-bot
          try {
            if (process.send) {
              process.send({
                type: 'subbotDisconnected',
                jid: sesionId,
                ownerJid: conn.botOwner || config.ownerJid,
                reason: String(reason || '401')
              });
            }
          } catch (_) {}
        } else {
          // Si es un error temporal (como conexión perdida), reintentar sin borrar la instancia todavía
          if (retryCount < maxRetries) {
            const jitter = Math.floor(Math.random() * 5000);
            const nextDelay = retryDelay + jitter;
            log('INFO', `[Subbot] Reintentando en ${nextDelay / 1000}s... (${retryCount + 1}/${maxRetries})`);
            const timer = setTimeout(() => {
              this.reconnectTimers.delete(sesionId);
              this.conectar(sesionId, null, false, retryCount + 1).catch(err =>
                log('ERROR', `[Subbot] Reintento falló para ${sesionId}: ${err.message}`)
              );
            }, nextDelay);
            this.reconnectTimers.set(sesionId, timer);
          } else {
            log('ERROR', `[Subbot] Máximos reintentos alcanzados para ${sesionId}.`);
            conn.ev.removeAllListeners();
            this.instances.delete(sesionId);
            await query("UPDATE subbots SET estado = 'error' WHERE jid = $1", [sesionId]);
          }
        }
      }
    });

    conn.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify' && type !== 'append') return;

      // Procesar mensajes en paralelo para evitar bloqueos en sub-bots
      Promise.allSettled(messages.map(async (msg) => {
        try {
          // En sub-bots, SÍ procesamos mensajes propios si el usuario los envía desde su teléfono
          const isFromMe = msg.key.fromMe;
          const isSubbot = conn.isSubbot === true;

          // Regla: Si es subbot, permitimos fromMe. Si es bot principal, lo ignoramos.
          if (isFromMe && !isSubbot) return;

          if (this.onMessage) {
            // Si el worker definió un manejador optimizado, usarlo
            await this.onMessage(conn, msg);
          } else {
            await handleMessage(conn, msg, this.plugins);
          }
        } catch (err) {
          if (
            err.message?.includes('No session found') ||
            err.message?.includes('forbidden') ||
            err.status === 403
          ) return;
          log('WARN', `[Subbot] Error procesando mensaje: ${err.message}`);
        }
      }));
    });

    return { conn };
  }

  async logout(sesionId) {
    const conn = this.instances.get(sesionId);
    if (conn) {
      this.manuallyLoggedOut.add(sesionId);
      await conn.logout();
      const timer = this.reconnectTimers.get(sesionId);
      if (timer) {
        clearTimeout(timer);
        this.reconnectTimers.delete(sesionId);
      }
      this.instances.delete(sesionId);
      return true;
    }
    return false;
  }
}

export const subbotManager = new SubbotManager();
