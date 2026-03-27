import { Boom } from '@hapi/boom';
import { Browsers, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, makeWASocket } from '@itsukichann/baileys';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import { fileURLToPath } from 'url';

import { usarAuthPostgres } from './src/lib/auth.js';
import { inicializarDB, obtenerGrupo } from './src/lib/database.js';
import { handleMessage } from './src/lib/handler.js';
import { kirbyHeader, log } from './src/lib/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── CARGADOR DE PLUGINS ──────────────────────────────────────────────────
const plugins = new Map();

async function cargarPlugins(dir) {
  const archivos = fs.readdirSync(dir);

  for (const archivo of archivos) {
    const rutaCompleta = path.join(dir, archivo);
    const stat = fs.statSync(rutaCompleta);

    if (stat.isDirectory()) {
      await cargarPlugins(rutaCompleta);
    } else if (archivo.endsWith('.js')) {
      try {
        // Optimización: Solo leer los primeros 1024 bytes para extraer metadatos
        // Esto es mucho más rápido que leer archivos de plugins grandes completos
        const fd = fs.openSync(rutaCompleta, 'r');
        const buffer = Buffer.alloc(1024);
        fs.readSync(fd, buffer, 0, 1024, 0);
        fs.closeSync(fd);

        const contenidoParcial = buffer.toString('utf-8');
        const lineas = contenidoParcial.split(/\r?\n/);

        const metadatos = {
          nombre: '',
          alias: [],
          categoria: 'General',
          descripcion: 'Sin descripción',
          reaccion: '🌸',
          ejecutar: null,
          ruta: rutaCompleta
        };

        for (const linea of lineas) {
          const trimmedLine = linea.trim();
          if (!trimmedLine.startsWith('// @')) continue;
          const match = trimmedLine.match(/\/\/\s*@([^:]+)\s*:\s*(.+)/i);
          if (match) {
            const [, clave, valor] = match;
            const lowClave = clave.trim().toLowerCase();
            if (lowClave === 'nombre' || lowClave === 'name') metadatos.nombre = valor.trim();
            if (lowClave === 'alias') metadatos.alias = valor.split(',').map(a => a.trim());
            if (lowClave === 'categoria' || lowClave === 'category') metadatos.categoria = valor.trim();
            if (lowClave === 'descripcion' || lowClave === 'descripción' || lowClave === 'description' || lowClave === 'desc') metadatos.descripcion = valor.trim();
            if (lowClave === 'reaccion' || lowClave === 'reaction') metadatos.reaccion = valor.trim();
          }
        }

        // Importar dinámicamente el plugin (ES Module)
        const modulo = await import(`file://${rutaCompleta}`);

        // El plugin debe exportar una función por defecto
        if (typeof modulo.default === 'function') {
          metadatos.ejecutar = modulo.default;

          if (metadatos.nombre) {
            plugins.set(metadatos.nombre, metadatos);
            // Registrar alias
            metadatos.alias.forEach(alias => {
              plugins.set(alias, metadatos);
            });
          } else {
            log('WARN', `El plugin ${archivo} no tiene // @nombre`);
          }
        } else {
          log('WARN', `El plugin ${archivo} no exporta una función por defecto`);
        }

      } catch (err) {
        log('ERROR', `Error cargando plugin ${archivo}: ${err.message}`);
      }
    }
  }
}

// ─── INICIAR BOT ──────────────────────────────────────────────────────────
async function iniciarBot() {
  log('INFO', 'Inicializando Base de Datos PostgreSQL...');
  await inicializarDB();

  log('INFO', 'Cargando plugins...');
  const pluginsDir = path.join(__dirname, 'plugins');
  if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true });
  await cargarPlugins(pluginsDir);
  log('OK', `Se cargaron ${new Set(Array.from(plugins.values())).size} plugins únicos.`);

  connectToWA();
}

async function connectToWA() {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  log('INFO', `Usando WA v${version.join('.')} (latest: ${isLatest})`);

  const { state, saveCreds } = await usarAuthPostgres('kirby_main');

  const conn = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }))
    },
    logger: pino({ level: 'fatal' }),
    browser: Browsers.macOS('Desktop'),
    generateHighQualityLinkPreview: false,
    syncFullHistory: false,
    defaultQueryTimeoutMs: 0, // Desactivar timeout para mayor velocidad en queries
    connectTimeoutMs: 30000,
    markOnlineOnConnect: true,
    getMessage: async (key) => {
      // Optimizador de mensajes para evitar lags en respuestas
      return { conversation: '' };
    }
  });

  conn.isSubbot = false;

  conn.ev.on('creds.update', async () => {
    try {
      await saveCreds();
    } catch (err) {
      // Silenciar errores de transacción de BD (comunes en concurrencia)
      if (err.message?.includes('transaction failed, rolling back')) {
        return;
      }
      log('WARN', `Error guardando credenciales: ${err.message}`);
    }
  });

  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      log('INFO', '✨ Nuevo código QR generado. Escanéalo en tu WhatsApp para vincular.');
    }

    if (connection === 'close') {
      const razon = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const mensajeError = lastDisconnect?.error?.message || 'Desconocido';

      log('WARN', `Conexión cerrada. Razón: ${razon} | Error: ${mensajeError}`);

      if (razon === DisconnectReason.badSession || razon === DisconnectReason.loggedOut) {
        log('ERROR', 'La sesión fue cerrada o está corrupta. Limpiando para re-vincular...');
        // Limpiamos solo los creds para forzar QR sin borrar todo el historial si no es necesario,
        // pero para asegurar, borraremos todo auth_keys de esta sesión.
        import('./src/lib/database.js').then(async (db) => {
           await db.query('DELETE FROM auth_keys WHERE id LIKE $1', ['kirby_main%']);
           log('OK', 'Sesión reseteada. Reinicia el bot para generar un nuevo QR.');
           process.exit(1);
        });
      } else {
        log('INFO', 'Intentando reconectar automáticamente en 5 segundos...');
        setTimeout(() => connectToWA(), 5000);
      }
    } else if (connection === 'open') {
      log('KIRBY', kirbyHeader());
      log('OK', 'Kirby Bot conectado y listo para recibir comandos!');
    }
  });

  // ─── MANEJADOR DE MENSAJES (Optimizado para paralelismo) ───────────────
  conn.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify' && type !== 'append') return;

    // Procesar mensajes en paralelo para evitar bloqueos en grupos activos
    Promise.allSettled(messages.map(async (msg) => {
      try {
        await handleMessage(conn, msg, plugins);
      } catch (err) {
        // Silenciar errores específicos de Baileys que son comunes
        if (
          err.message?.includes('No session found') ||
          err.message?.includes('forbidden') ||
          err.status === 403
        ) return;

        log('WARN', `Error procesando mensaje: ${err.message}`);
      }
    }));
  });

  // ─── INICIAR SUB-BOTS EN INSTANCIA SEPARADA ────────────────────────────
  const { fork } = await import('child_process');
  const subbotProcess = fork(path.join(__dirname, 'subbots.js'));

  subbotProcess.on('message', async (msg) => {
    if (msg.type === 'ready') {
      log('OK', 'Instancia secundaria de Sub-Bots lista.');
    } else if (msg.type === 'pairingCode') {
      const { jid, code, responseInfo } = msg;
      const phoneNumber = jid.split('@')[0];
      const formatted = code.match(/.{1,4}/g)?.join('-') || code;

      log('OK', `[Subbot] Enviando código ${formatted} a ${responseInfo.remoteJid}`);

      await conn.sendMessage(responseInfo.remoteJid, {
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
    } else if (msg.type === 'pairingError') {
      const { responseInfo, error } = msg;
      if (error === 'limit') {
        await conn.sendMessage(responseInfo.remoteJid, {
          text: `⚠️ *Límite excedido.* WhatsApp bloqueó las vinculaciones para este número por hoy.`
        }, { quoted: responseInfo.key ? { key: responseInfo.key, message: {} } : null });
      }
    } else if (msg.type === 'subbotDisconnected') {
      // Notificar al dueño del sub-bot que su sesión expiró
      const { ownerJid, jid, reason } = msg;
      const phone = jid.split('@')[0];
      try {
        await conn.sendMessage(ownerJid, {
          text:
            `✦ 𝘚𝘶𝘣-𝘉𝘰𝘵 𝘥𝘦𝘴𝘤𝘰𝘯𝘦𝘤𝘵𝘢𝘥𝘰 ✦\n\n` +
            `• Número: +${phone}\n` +
            `• Motivo: Sesión expirada (código ${reason})\n\n` +
            `Acción requerida:\n` +
            `• Vuelve a vincular este sub-bot usando *vinculación por número* desde WhatsApp.\n` +
            `• Si el sistema te mostró un código, úsalo dentro del tiempo indicado.\n\n` +
            `Nota: No es necesario borrar el sub-bot; al vincular, la sesión se guardará automáticamente.`
        });
      } catch (e) {
        log('WARN', `No se pudo notificar al dueño ${ownerJid}: ${e.message}`);
      }
    }
  });

  // Exportar para que otros plugins puedan enviar mensajes al proceso de subbots
  conn.subbotProcess = subbotProcess;

  // ─── EVENTOS DE GRUPO (BIENVENIDAS / DESPEDIDAS) ────────────────────────
  conn.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update;
    try {
      const dbGroup = await obtenerGrupo(id);
      if (!dbGroup) return;

      // El bot puede no tener acceso a ciertos grupos (forbidden) — lo ignoramos silenciosamente
      let groupName = 'el grupo';
      let groupDesc = '';
      try {
        const metadata = await conn.groupMetadata(id);
        groupName = metadata.subject || groupName;
        groupDesc = metadata.desc || '';
      } catch (_) { /* sin acceso al grupo, usamos valores por defecto */ }

      for (const participant of participants) {
        const jid = typeof participant === 'string' ? participant : participant.id;
        if (!jid) continue;

        try {
          if (action === 'add' && dbGroup.bienvenida && dbGroup.msg_bienvenida) {
            let msg = dbGroup.msg_bienvenida
              .replace(/@user/g, `@${jid.split('@')[0]}`)
              .replace(/@group/g, groupName)
              .replace(/@desc/g, groupDesc);

            const hasBanner = dbGroup.banner_bienvenida?.startsWith('http');
            try {
              if (hasBanner) {
                await conn.sendMessage(id, { image: { url: dbGroup.banner_bienvenida }, caption: msg, mentions: [jid] });
              } else {
                await conn.sendMessage(id, { text: msg, mentions: [jid] });
              }
            } catch (e) {
              if (!e.message?.includes('forbidden')) {
                log('WARN', `[Grupos] No se pudo enviar bienvenida a ${id}: ${e.message}`);
              }
            }
          }
          else if (action === 'remove' && dbGroup.despedida && dbGroup.msg_despedida) {
            let msg = dbGroup.msg_despedida
              .replace(/@user/g, `@${jid.split('@')[0]}`)
              .replace(/@group/g, groupName);

            const hasBanner = dbGroup.banner_despedida?.startsWith('http');
            try {
              if (hasBanner) {
                await conn.sendMessage(id, { image: { url: dbGroup.banner_despedida }, caption: msg, mentions: [jid] });
              } else {
                await conn.sendMessage(id, { text: msg, mentions: [jid] });
              }
            } catch (e) {
              if (!e.message?.includes('forbidden')) {
                log('WARN', `[Grupos] No se pudo enviar despedida a ${id}: ${e.message}`);
              }
            }
          }
        } catch (sendErr) {
          log('WARN', `[Grupos] No se pudo enviar msg a ${id}: ${sendErr.message}`);
        }
      }
    } catch (err) {
      log('ERROR', `Error en eventos de participantes del grupo: ${err.message}`);
    }
  });
}

// Iniciar
iniciarBot().catch(err => console.error('Error fatal al iniciar:', err));

// ─── MANEJO DE CIERRE GRACIOSO ──────────────────────────────────────────
const shutdown = async () => {
  log('INFO', '📦 Guardando sesiones de sub-bots y apagando...');
  try {
    const { subbotManager } = await import('./src/lib/subbotManager.js');
    for (const [id, conn] of subbotManager.instances) {
      conn.ev.removeAllListeners();
      if (conn.ws) conn.ws.close();
    }
  } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
