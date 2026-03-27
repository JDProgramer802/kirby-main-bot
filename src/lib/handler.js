import config from './config.js';
import { cache, getBotConfig, obtenerGrupo, obtenerUsuario } from './database.js';
import { log } from './utils.js';

export const messageCache = new Map();
const MAX_JID_CACHE = 500; // Limite de JIDs en cache para evitar consumo de RAM
const MAX_MESSAGES_PER_JID = 100;

function cacheMessage(m) {
  if (!m.key || !m.key.remoteJid) return;
  const jid = m.key.remoteJid;

  // Limpieza del cache global si excede el limite de JIDs
  if (messageCache.size >= MAX_JID_CACHE && !messageCache.has(jid)) {
    const firstKey = messageCache.keys().next().value;
    messageCache.delete(firstKey);
  }

  if (!messageCache.has(jid)) messageCache.set(jid, []);

  const arr = messageCache.get(jid);
  arr.push(m.key);
  if (arr.length > MAX_MESSAGES_PER_JID) arr.shift();
}

/**
 * Manejador universal de mensajes para instancias de Kirby Bot
 * @param {import('@itsukichann/baileys').WASocket} conn - Instancia de conexión
 * @param {object} m - Mensaje crudo de Baileys
 * @param {Map} plugins - Mapa de plugins cargados
 */
export async function handleMessage(conn, m, plugins) {
  if (!m.message) return;
  if (!m.key || !m.key.remoteJid) {
    log('WARN', 'Mensaje sin key o remoteJid válido, ignorando');
    return;
  }
  cacheMessage(m);

  // Extraer texto del mensaje (incluyendo soporte para botones)
  let textOriginal =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    m.message?.buttonsResponseMessage?.selectedButtonId ||
    m.message?.templateButtonReplyMessage?.selectedId ||
    '';

  const interactive = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
  if (interactive) {
    try {
      const data = JSON.parse(interactive);
      textOriginal = data.id || interactive;
    } catch {
      textOriginal = interactive;
    }
  }

  // Prefijo dinámico (Bot Principal vs Sub-Bots)
  const isSubbot = conn.isSubbot === true;
  const prefijo = isSubbot ? '.' : config.prefijo;

  if (!textOriginal.startsWith(prefijo)) return;

  // Ignorar si el mensaje solo contiene el prefijo o está vacío después de él
  const sinPrefijo = textOriginal.slice(prefijo.length).trim();
  if (!sinPrefijo) return;

  // Procesar comando
  const parts = sinPrefijo.split(/ +/);
  const comando = (parts[0] || '').toLowerCase();
  const argsArray = parts.slice(1);
  const text = argsArray.join(' ');

  const plugin = plugins.get(comando);
  if (!plugin) return;

  const sender = m.key.participant || m.key.remoteJid;
  if (!sender || typeof sender !== 'string') {
    log('WARN', 'Mensaje con sender inválido, ignorando');
    return;
  }
  const remoteJid = m.key.remoteJid;
  if (!remoteJid || typeof remoteJid !== 'string') {
    log('WARN', 'Mensaje con remoteJid inválido, ignorando');
    return;
  }
  const isGroup = remoteJid.endsWith('@g.us');

  // Detección de identidad (Número y LID)
  const esNumero = sender.includes('@s.whatsapp.net');
  const esLid = sender.endsWith('@lid');
  const senderNumber = esNumero ? sender.split('@')[0] : '';
  const senderLid = esLid ? sender : '';

  // Determinar dueño (prioridad al dueño específico de la sesión)
  const ownerJid = conn.botOwner || config.ownerJid;
  const myJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';

  // Mejorar detección de dueño para soportar LID y números normales
  const isOwner = (() => {
    // Comparación directa exacta
    if (sender === ownerJid || sender === config.ownerJid || sender === myJid) {
      console.log(`✅ Dueño detectado por comparación directa: ${sender}`);
      return true;
    }
    
    // Si el sender es LID, comparar con owner LID
    if (esLid && ownerJid?.endsWith('@lid')) {
      const isMatch = sender === ownerJid;
      if (isMatch) console.log(`✅ Dueño LID detectado: ${sender}`);
      return isMatch;
    }
    
    // Si el owner es LID, extraer número para comparación flexible
    if (ownerJid?.endsWith('@lid') && esNumero) {
      const ownerNumber = ownerJid.split('@')[0];
      const isMatch = senderNumber === ownerNumber;
      if (isMatch) console.log(`✅ Dueño detectado por número (owner LID): ${senderNumber} == ${ownerNumber}`);
      return isMatch;
    }
    
    // Si ambos son números, comparar números
    if (esNumero && ownerJid?.includes('@s.whatsapp.net')) {
      const ownerNumber = ownerJid.split('@')[0];
      const isMatch = senderNumber === ownerNumber;
      if (isMatch) console.log(`✅ Dueño detectado por número: ${senderNumber} == ${ownerNumber}`);
      return isMatch;
    }
    
    console.log(`❌ No es dueño. Sender: ${sender}, OwnerJid: ${ownerJid}, ConfigOwner: ${config.ownerJid}`);
    return false;
  })();

  try {
    // DB y Contexto - Ejecución en paralelo para mayor velocidad
    // Obtenemos el nivel previo del cache antes de actualizar
    const oldUser = cache.usuarios.get(sender);
    const oldLevel = oldUser?.value?.nivel;

    const [dbUser, dbGroup] = await Promise.all([
      obtenerUsuario(sender),
      isGroup ? obtenerGrupo(m.key.remoteJid) : Promise.resolve(null)
    ]);

    // --- Notificación de Nivel (Level Up) ---
    if (oldLevel && dbUser.nivel > oldLevel) {
      const txt = `✨ *¡FELICIDADES!* ✨\n\n` +
                  `🌟 *${dbUser.nombre || sender.split('@')[0]}*, has subido de nivel!\n` +
                  `📈 *Nivel Actual:* ${dbUser.nivel}\n` +
                  `🌸 _¡Sigue así!_`;

      conn.sendMessage(remoteJid, {
        text: txt,
        contextInfo: {
          externalAdReply: {
            title: 'KIRBY LEVEL UP',
            body: `¡Has alcanzado el nivel ${dbUser.nivel}!`,
            thumbnailUrl: 'https://i.ibb.co/VvWnZkX/kirby-levelup.png',
            mediaType: 1
          }
        }
      }, { quoted: m }).catch(() => {});
    }

    // --- Lógica Autojoin (Optimizado) ---
    if (!isGroup && isOwner && textOriginal.includes('chat.whatsapp.com/')) {
      const autojoinActivo = await getBotConfig('autojoin', 'off');
      if (autojoinActivo === 'on') {
        const code = textOriginal.split('chat.whatsapp.com/')[1].split(' ')[0];
        if (code) {
          conn.groupAcceptInvite(code).then(() => {
            conn.sendMessage(remoteJid, { text: '✅ *Autojoin:* Me he unido al grupo detectado.' });
          }).catch(() => {});
        }
      }
    }

    const ctx = {
      conn,
      args: argsArray,
      text,
      comando,
      sender,
      senderNumber,
      senderLid,
      isGroup,
      dbUser,
      dbGroup,
      plugins,
      isOwner,
      prefijo,
      reply: async (txt, options = {}) => {
        if (options.presence) {
          conn.sendPresenceUpdate('composing', remoteJid).catch(() => {});
        }
        return conn.sendMessage(remoteJid, { text: txt }, { quoted: m, ...options });
      },
      presence: async (type = 'composing') => conn.sendPresenceUpdate(type, remoteJid),
      react: async (emoji) => conn.sendMessage(remoteJid, { react: { text: emoji, key: m.key } })
    };

    // Ejecutar reacción y comando de forma más fluida
    if (plugin.reaccion) ctx.react(plugin.reaccion).catch(() => {});

    const startTime = Date.now();
    if (!isSubbot) {
      log('CMD', `[${isGroup ? remoteJid.split('@')[0] : 'DM'}] ${sender.split('@')[0]} → ${prefijo}${comando}${text ? ` "${text.slice(0, 40)}"` : ''}`);
    }

    await plugin.ejecutar(m, ctx);

    const ms = Date.now() - startTime;
    if (!isSubbot) {
      log('OK', `${prefijo}${comando} ejecutado en ${ms}ms`);
    }
  } catch (err) {
    const isForbidden = err.message?.includes('forbidden') || err.status === 403;

    if (isForbidden) {
      log('WARN', `Acceso prohibido para ${prefijo}${comando} en ${remoteJid.split('@')[0]}`);
      return; // No intentamos enviar mensaje de error si no tenemos permiso
    }

    log('ERROR', `Error en plugin ${comando}: ${err.message}`);
    conn.sendMessage(m.key.remoteJid, { text: `❌ Error: ${err.message}` }, m.key ? { quoted: m } : {}).catch(() => {});
  }
}
