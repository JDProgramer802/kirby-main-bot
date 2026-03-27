// ─────────────────────────────────────────────────────────────────────────────
// src/lib/utils.js — Utilidades globales del Bot Kirby Dream
// ─────────────────────────────────────────────────────────────────────────────
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from './config.js';

// ─── Normalización de JID ─────────────────────────────────────────────────
/**
 * Normaliza cualquier JID (incluyendo LID) al formato estándar de WhatsApp.
 * Extrae solo el número de teléfono.
 */
export function normalizarJid(jid = '') {
  if (!jid) return '';
  const parts = jid.split('@');
  if (parts.length < 2) return jid;
  const numero = parts[0].split(':')[0];
  const dominio = parts[1];
  return `${numero}@${dominio}`;
}

/** Extrae el número de teléfono limpio de un JID */
export function extraerNumero(jid = '') {
  return jid.split('@')[0].split(':')[0];
}

// ─── Formato numérico ─────────────────────────────────────────────────────
/** Formatea número con separador de miles */
export function formatearNumero(n) {
  return Number(n).toLocaleString('en-US');
}

/** Formatea monedas con su emoji */
export function formatearMonedas(cantidad) {
  return `${config.economia.monedaEmoji} ${formatearNumero(cantidad)} ${config.economia.monedaNombre}`;
}

// ─── Tiempo ───────────────────────────────────────────────────────────────
/** Convierte segundos a una cadena legible: "2h 30m 15s" */
export function formatearTiempo(segundos) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = Math.floor(segundos % 60);
  const partes = [];
  if (h > 0) partes.push(`${h}h`);
  if (m > 0) partes.push(`${m}m`);
  if (s > 0 || partes.length === 0) partes.push(`${s}s`);
  return partes.join(' ');
}

/** Calcula los segundos restantes desde una fecha hasta que pase el cooldown */
export function cooldownRestante(ultimaFecha, cooldownSegundos) {
  if (!ultimaFecha) return 0;
  const transcurrido = (Date.now() - new Date(ultimaFecha).getTime()) / 1000;
  const restante = cooldownSegundos - transcurrido;
  return restante > 0 ? Math.ceil(restante) : 0;
}

// ─── Nivel y XP ───────────────────────────────────────────────────────────
/** Calcula el nivel de un usuario según su XP */
export function calcularNivel(xp) {
  return Math.floor(Math.sqrt(xp / config.xpCoeficiente)) + 1;
}

/** XP necesaria para un nivel */
export function xpParaNivel(nivel) {
  return Math.pow(nivel - 1, 2) * config.xpCoeficiente;
}

// ─── Aleatorio ────────────────────────────────────────────────────────────
/** Devuelve un número entero aleatorio entre min y max (inclusive) */
export function aleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Elige un elemento aleatorio de un array */
export function elegirAleatorio(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Diseño Visual "Kirby Kawaii" (Sin Emojis) ───────────────────────────
export function kirbyBox(titulo, contenido = '', footer = '') {
  const t = toBoldSerif(titulo.toUpperCase());
  const top = `✩─── ꒰ ${t} ꒱ ───✩`;

  let lineas;
  if (Array.isArray(contenido)) {
    lineas = contenido;
  } else if (typeof contenido === 'string') {
    lineas = contenido.split('\n');
  } else {
    lineas = [String(contenido)];
  }

  const lineasFormateadas = lineas.map(l => `  |  ${l}`).join('\n');

  const bottom = footer
    ? `✩─── ꒰ ${toSmallCaps(footer)} ꒱ ───✩`
    : `✩━━━━━━━━━━━━━━━✩`;

  return [top, lineasFormateadas, bottom].filter(Boolean).join('\n');
}

export function kirbyHeader() {
  const title = toBoldSerif('Kirby Dream');
  const status = toSmallCaps('system online');
  return `╭  ꒰ ${title} ꒱\n┊  『 ${status} 』\n╰━━━━━━━━━━━━━━✩`;
}

export function separador(symbol = '✧') {
  return `⊱ ${symbol} ──────────── ${symbol} ⊰`;
}

export function destellos(texto) {
  return `⊹ ${texto} ⊹`;
}

// ─── Menciones ────────────────────────────────────────────────────────────
export function extraerMenciones(mensaje) {
  return mensaje?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

export function obtenerCitado(mensaje) {
  const ctx = mensaje?.message?.extendedTextMessage?.contextInfo;
  if (!ctx?.quotedMessage) return null;
  const remitente = ctx.participant || ctx.remoteJid;
  return {
    jid: normalizarJid(remitente),
    mensaje: ctx.quotedMessage,
    clave: {
      remoteJid: mensaje.key.remoteJid,
      id: ctx.stanzaId,
      fromMe: ctx.participant === undefined,
      participant: ctx.participant,
    },
  };
}

// ─── Texto ────────────────────────────────────────────────────────────────
export function procesarSaltosLinea(texto) {
  return texto.replace(/\\n/g, '\n');
}

export function esUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export function truncar(texto, maxChars = 100) {
  if (!texto) return '';
  return texto.length > maxChars ? texto.slice(0, maxChars) + '...' : texto;
}

// ─── Media ────────────────────────────────────────────────────────────────
export function tipoMensaje(mensaje) {
  const tipos = Object.keys(mensaje?.message || {});
  return tipos.find(t => t !== 'messageContextInfo' && t !== 'senderKeyDistributionMessage') || 'unknown';
}

export function tieneMedia(mensaje) {
  const tipo = tipoMensaje(mensaje);
  return ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'].includes(tipo);
}

// ─── Colores de consola ───────────────────────────────────────────────────
export const colores = {
  reset: '\x1b[0m',
  rosa: '\x1b[35m',
  cyan: '\x1b[36m',
  verde: '\x1b[32m',
  amarillo: '\x1b[33m',
  rojo: '\x1b[31m',
  blanco: '\x1b[37m',
  negrita: '\x1b[1m',
};

export function log(tipo, mensaje) {
  const mapa = {
    INFO: `${colores.cyan}[INFO]${colores.reset}`,
    OK: `${colores.verde}[OK]${colores.reset}`,
    WARN: `${colores.amarillo}[WARN]${colores.reset}`,
    ERROR: `${colores.rojo}[ERROR]${colores.reset}`,
    KIRBY: `${colores.rosa}[KIRBY]${colores.reset}`,
  };
  const prefijo = mapa[tipo] || `[${tipo}]`;
  console.log(`${prefijo} ${mensaje}`);
}

// ─── Reacciones ───────────────────────────────────────────────────────────
export async function reactionAction(m, ctx, category, type, actionText) {
  const { conn, sender, args } = ctx;

  const menciones = extraerMenciones(m);
  const citado = obtenerCitado(m);

  let who = menciones[0] || (citado ? citado.jid : null);

  if (!who && args[0]) {
    const cleanNum = args[0].replace(/[@]/g, '');
    if (cleanNum.length > 8) {
      who = cleanNum.includes('lid') ? cleanNum : `${cleanNum}@s.whatsapp.net`;
    }
  }

  if (!who) who = sender;

  const tmpDir = path.resolve('tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  const id = uuidv4();
  const gifPath = path.join(tmpDir, `${id}.gif`);
  const mp4Path = path.join(tmpDir, `${id}.mp4`);

  try {
    let gifUrl = '';

    const synonyms = {
      'angry': ['angry', 'stare', 'angrystare', 'pout'],
      'bath': ['bath', 'shower', 'swim'],
      'bite': ['bite', 'nibble'],
      'bleh': ['bleh', 'tongue', 'mock'],
      'blush': ['blush', 'smile', 'happy'],
      'bored': ['bored', 'sleep', 'tired'],
      'call': ['call', 'phone'],
      'clap': ['clap', 'applaud', 'happy'],
      'coffee': ['coffee', 'drink', 'tea'],
      'cold': ['cold', 'shiver'],
      'cook': ['cook', 'food', 'feed', 'eat'],
      'cry': ['cry', 'sad', 'depressed'],
      'cuddle': ['cuddle', 'hug', 'pat'],
      'dance': ['dance', 'happy', 'party'],
      'dramatic': ['dramatic', 'shock', 'surprised'],
      'draw': ['draw', 'art', 'write'],
      'drunk': ['drunk', 'drink', 'beer'],
      'eat': ['eat', 'feed', 'food'],
      'facepalm': ['facepalm', 'disappointed', 'thinking'],
      'gaming': ['gaming', 'game', 'play'],
      'greet': ['greet', 'wave', 'hi', 'hello'],
      'happy': ['happy', 'smile', 'laugh'],
      'heat': ['heat', 'hot', 'sweat'],
      'hug': ['hug', 'cuddle', 'pat'],
      'jump': ['jump', 'happy', 'dance'],
      'kill': ['kill', 'punch', 'slap', 'dead'],
      'kiss': ['kiss', 'kisscheek', 'love'],
      'kisscheek': ['kisscheek', 'kiss', 'love'],
      'laugh': ['laugh', 'smile', 'grin'],
      'lewd': ['lewd', 'smug', 'smile'],
      'lick': ['lick', 'tongue'],
      'love': ['love', 'kiss', 'hug', 'happy'],
      'nope': ['nope', 'no', 'stop'],
      'pat': ['pat', 'cuddle', 'headrub'],
      'poke': ['poke', 'tickle'],
      'pout': ['pout', 'angry', 'stare'],
      'psycho': ['psycho', 'angry', 'kill'],
      'punch': ['punch', 'slap', 'kick'],
      'push': ['push', 'punch', 'slap'],
      'run': ['run', 'escape'],
      'sad': ['sad', 'cry', 'depressed'],
      'scared': ['scared', 'shock', 'surprised'],
      'scream': ['scream', 'angry', 'shout'],
      'seduce': ['seduce', 'smug', 'smile'],
      'shy': ['shy', 'blush', 'smile'],
      'sing': ['sing', 'music'],
      'slap': ['slap', 'punch', 'kick'],
      'sleep': ['sleep', 'rest', 'tired'],
      'smoke': ['smoke', 'rest'],
      'spit': ['spit', 'angry'],
      'step': ['step', 'stomp', 'kick'],
      'think': ['think', 'thinking', 'ponder'],
      'tickle': ['tickle', 'poke', 'laugh'],
      'walk': ['walk', 'run'],
      'anal': ['anal', 'fuck', 'classic'],
      'blowjob': ['blowjob', 'bj', 'suck'],
      'boobjob': ['boobjob', 'paizuri', 'breasts'],
      'cum': ['cum', 'creampie', 'cumshot'],
      'fuck': ['fuck', 'classic', 'hentai', 'sex'],
      'spank': ['spank', 'slap', 'hit'],
      'threesome': ['threesome', 'group', 'fuck'],
      'solo': ['solo', 'masturbation', 'fap'],
      'yaoi': ['yaoi', 'gay', 'fuck'],
      'pussylick': ['pussylick', 'cunnilingus', 'lickpussy', 'eat']
    };

    const tagsToTry = [...(synonyms[type] || [type])];
    tagsToTry.push(category === 'sfw' ? 'waifu' : 'blowjob');

    const apiPromises = [];
    const ensureGif = (url) => {
      if (url && url.endsWith('.gif')) return url;
      throw new Error('Not a GIF');
    };

    for (const tag of tagsToTry) {
      apiPromises.push(axios.get(`https://api.waifu.pics/${category}/${tag}`, { timeout: 4000 }).then(r => ensureGif(r.data?.url)));
      if (category === 'sfw') {
        apiPromises.push(axios.get(`https://api.otakugifs.xyz/gif?reaction=${tag}`, { timeout: 4000 }).then(r => ensureGif(r.data?.url)));
      }
      apiPromises.push(axios.get(`https://nekos.best/api/v2/${tag}`, { timeout: 4000 }).then(r => ensureGif(r.data?.results?.[0]?.url)));
      apiPromises.push(axios.get(`https://nekos.life/api/v2/img/${tag}`, { timeout: 4000 }).then(r => ensureGif(r.data?.url)));
      apiPromises.push(axios.get(`https://api.waifu.im/search?included_tags=${tag}&is_nsfw=${category === 'nsfw'}`, { timeout: 4000 }).then(r => ensureGif(r.data?.images?.[0]?.url)));
      apiPromises.push(axios.get(`https://purrbot.site/api/img/${category}/${tag}/gif`, { timeout: 4000 }).then(r => ensureGif(r.data?.link)));
    }

    try {
      gifUrl = await Promise.any(apiPromises);
    } catch (_) {
      if (category === 'nsfw') {
        try { const res = await axios.get('https://api.waifu.pics/nsfw/blowjob'); gifUrl = res.data?.url; } catch (e) {}
      } else {
        try { const res = await axios.get('https://api.waifu.pics/sfw/hug'); gifUrl = res.data?.url; } catch (e) {}
      }
    }

    if (!gifUrl) throw new Error('No se pudo obtener imagen de ninguna API (incluyendo fallbacks)');

    const response = await axios({ url: gifUrl, method: 'GET', responseType: 'stream' });
    const writer = fs.createWriteStream(gifPath);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    ffmpeg.setFfmpegPath(config.paths.ffmpeg);
    await new Promise((resolve, reject) => {
      ffmpeg(gifPath)
        .outputOptions([
          '-pix_fmt yuv420p',
          '-c:v libx264',
          '-preset ultrafast',
          '-crf 28',
          '-movflags +faststart',
          '-filter:v', 'crop=floor(in_w/2)*2:floor(in_h/2)*2'
        ])
        .toFormat('mp4')
        .save(mp4Path)
        .on('end', resolve)
        .on('error', reject);
    });

    const user1 = m.pushName || sender.split('@')[0];
    let user2;
    if (who === sender) {
      user2 = category === 'sfw' ? (type === 'hug' ? 'sí mismo' : 'todos') : 'sí mismo';
    } else {
      user2 = `@${who.split('@')[0]}`;
    }

    const selectedAction = Array.isArray(actionText) ? elegirAleatorio(actionText) : actionText;
    const txt = `✨ *${toBoldSerif(user1)}* ${toSmallCaps(selectedAction)} ${user2} ✨`;

    const buffer = fs.readFileSync(mp4Path);
    await conn.sendMessage(m.key.remoteJid, {
      video: buffer,
      caption: txt,
      gifPlayback: true,
      mentions: [sender, who]
    }, { quoted: m });

  } catch (err) {
    console.error(`Error en reactionAction (${type}):`, err.message);
    ctx.reply(`(>_<) No pude procesar la reacción de *${type}*`);
  } finally {
    try {
      if (fs.existsSync(gifPath)) fs.unlinkSync(gifPath);
      if (fs.existsSync(mp4Path)) fs.unlinkSync(mp4Path);
    } catch (e) {}
  }
}

// ─── Tipografía Unicode ───────────────────────────────────────────────────
export function toSmallCaps(str) {
  const map = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ',
    k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'Q', r: 'ʀ', s: 'ꜱ', t: 'ᴛ',
    u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ',
    á: 'ᴀ', é: 'ᴇ', í: 'ɪ', ó: 'ᴏ', ú: 'ᴜ', ñ: 'ɴ',
  };
  return str.toLowerCase().split('').map(c => map[c] || c).join('');
}

export function toBoldSerif(str) {
  const map = {
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳'
  };
  return str.split('').map(c => map[c] || c).join('');
}

export function toBubble(str) {
  const map = {
    'A': 'Ⓐ', 'B': 'Ⓑ', 'C': 'Ⓒ', 'D': 'Ⓓ', 'E': 'Ⓔ', 'F': 'Ⓕ', 'G': 'Ⓖ', 'H': 'Ⓗ', 'I': 'Ⓘ', 'J': 'Ⓙ', 'K': 'Ⓚ', 'L': 'Ⓛ', 'M': 'Ⓜ', 'N': 'Ⓝ', 'O': 'Ⓞ', 'P': 'Ⓟ', 'Q': 'Ⓠ', 'R': 'Ⓡ', 'S': 'Ⓢ', 'T': 'Ⓣ', 'U': 'Ⓤ', 'V': 'Ⓥ', 'W': 'Ⓦ', 'X': 'Ⓧ', 'Y': 'Ⓨ', 'Z': 'Ⓩ',
    'a': 'ⓐ', 'b': 'ⓑ', 'c': 'ⓒ', 'd': 'ⓓ', 'e': 'ⓔ', 'f': 'ⓕ', 'g': 'ⓖ', 'h': 'ⓗ', 'i': 'ⓘ', 'j': 'ⓙ', 'k': 'ⓚ', 'l': 'ⓛ', 'm': 'ⓜ', 'n': 'ⓝ', 'o': 'ⓞ', 'p': 'ⓟ', 'q': 'ⓠ', 'r': 'ⓡ', 's': 'ⓢ', 't': 'ⓣ', 'u': 'ⓤ', 'v': 'ⓥ', 'w': 'ⓦ', 'x': 'ⓧ', 'y': 'ⓨ', 'z': 'ⓩ'
  };
  return str.split('').map(c => map[c] || c).join('');
}

export function toKawaii(str) {
  const map = {
    'a': 'α', 'b': 'в', 'c': '¢', 'd': '∂', 'e': 'є', 'f': 'ƒ', 'g': 'g', 'h': 'н', 'i': 'ι', 'j': 'נ', 'k': 'к', 'l': 'ℓ', 'm': 'м', 'n': 'η', 'o': 'σ', 'p': 'ρ', 'q': 'ף', 'r': 'я', 's': 'ѕ', 't': 'т', 'u': 'υ', 'v': 'ν', 'w': 'ω', 'x': 'χ', 'y': 'у', 'z': 'z'
  };
  return str.toLowerCase().split('').map(c => map[c] || c).join('');
}

export function kirbyBoxUltimate(titulo, contenido = '', footer = '') {
  const t = toBubble(titulo.toUpperCase());
  const top = `⭐ ━━━ ꒰ ✨ *${t}* ✨ ꒱ ━━━ ⭐`;

  let lineas;
  if (Array.isArray(contenido)) {
    lineas = contenido;
  } else if (typeof contenido === 'string') {
    lineas = contenido.split('\n');
  } else {
    lineas = [String(contenido)];
  }

  const lineasFormateadas = lineas.map(l => `  🌸 ${l}`).join('\n');

  const bottom = footer
    ? `⭐ ━━━ ꒰ 🍬 *${toSmallCaps(footer)}* 🍬 ꒱ ━━━ ⭐`
    : `⭐ ━━━━━━━━━━━━━━━━━━ ⭐`;

  return [top, lineasFormateadas, bottom].filter(Boolean).join('\n');
}

// ─── Sticker EXIF ─────────────────────────────────────────────────────────
/**
 * Genera el JSON con los metadatos del sticker.
 * WhatsApp lee estos campos para mostrar el nombre del pack y el autor.
 * packname y author son textos base; aquí solo se decoran/tipografían.
 */
export function createStickerExif(packname = config.botNombre, author = config.botDev) {
  const baseName = (packname || config.botNombre).toString().slice(0, 48);
  const baseAuthor = (author || config.botDev).toString().slice(0, 48);

  const styledName = toBubble(baseName.toUpperCase());
  const styledAuthor = toSmallCaps(baseAuthor);

  return {
    'sticker-pack-id': `kirby-dream-${Date.now()}`,
    'sticker-pack-name': styledName,
    'sticker-pack-publisher': styledAuthor,
  };
}

/**
 * Inserta correctamente un chunk EXIF dentro del contenedor RIFF/WebP,
 * actualizando el tamaño total del archivo para que WhatsApp lo procese bien.
 *
 * Estructura RIFF:
 *   Bytes 0-3  : "RIFF"
 *   Bytes 4-7  : tamaño total del archivo - 8  (little-endian uint32)
 *   Bytes 8-11 : "WEBP"
 *   Bytes 12+  : chunks (VP8, VP8L, VP8X, ANIM, ANMF, EXIF, XMP…)
 *
 * Cada chunk:
 *   Bytes 0-3  : FourCC (ej. "EXIF")
 *   Bytes 4-7  : tamaño del payload (little-endian uint32)
 *   Bytes 8+   : payload  (si el tamaño es impar, se añade 1 byte de padding 0x00)
 *
 * Para que WhatsApp muestre packname/author el WebP debe ser "extendido" (VP8X).
 * Si el WebP ya tiene VP8X solo añadimos el chunk EXIF al final y actualizamos
 * el campo de tamaño RIFF. Si no tiene VP8X, lo convertimos agregando el canvas VP8X
 * antes del chunk VP8/VP8L existente.
 */
export function addExifToWebP(webpBuffer, exifData) {
  // ── 1. Validar que sea RIFF/WEBP ────────────────────────────────────────
  if (
    webpBuffer.slice(0, 4).toString('ascii') !== 'RIFF' ||
    webpBuffer.slice(8, 12).toString('ascii') !== 'WEBP'
  ) {
    throw new Error('El buffer no es un archivo WebP válido (cabecera RIFF/WEBP no encontrada)');
  }

  // ── 2. Serializar los metadatos a JSON → Buffer ──────────────────────────
  const jsonStr   = JSON.stringify(exifData);
  const jsonBytes = Buffer.from(jsonStr, 'utf8');

  // ── 3. Construir el chunk EXIF ───────────────────────────────────────────
  // FourCC "EXIF" + uint32LE tamaño + payload (+ 1 byte padding si impar)
  const exifFourCC = Buffer.from('EXIF', 'ascii');
  const exifSize   = Buffer.alloc(4);
  exifSize.writeUInt32LE(jsonBytes.length, 0);
  const exifPadding = jsonBytes.length % 2 === 1 ? Buffer.alloc(1) : Buffer.alloc(0);
  const exifChunk  = Buffer.concat([exifFourCC, exifSize, jsonBytes, exifPadding]);

  // ── 4. Detectar si ya tiene chunk VP8X ──────────────────────────────────
  let hasVP8X = false;
  let offset  = 12; // saltamos "RIFF" + size + "WEBP"

  while (offset + 8 <= webpBuffer.length) {
    const fourCC    = webpBuffer.slice(offset, offset + 4).toString('ascii');
    const chunkSize = webpBuffer.readUInt32LE(offset + 4);
    if (fourCC === 'VP8X') { hasVP8X = true; break; }
    if (fourCC === 'VP8 ' || fourCC === 'VP8L') break;
    offset += 8 + chunkSize + (chunkSize % 2); // avanzar con padding
  }

  let newBody;

  if (hasVP8X) {
    // ── 4a. Ya tiene VP8X: activar el bit EXIF (bit 3 del byte de flags) y añadir chunk
    //   VP8X payload: [flags:4bytes][canvas_width_minus1:3bytes][canvas_height_minus1:3bytes]
    //   flags byte 0, bit 3 = EXIF metadata present
    const vp8xOffset = webpBuffer.indexOf('VP8X', 12);
    if (vp8xOffset !== -1 && vp8xOffset + 18 <= webpBuffer.length) {
      // Modificamos sobre una copia para no mutar el original
      newBody = Buffer.from(webpBuffer);
      newBody[vp8xOffset + 8] = newBody[vp8xOffset + 8] | 0x08; // activar bit EXIF
    } else {
      newBody = Buffer.from(webpBuffer);
    }
    newBody = Buffer.concat([newBody, exifChunk]);
  } else {
    // ── 4b. No tiene VP8X: hay que crearlo e insertarlo justo después de "WEBP"
    //   Necesitamos las dimensiones del canvas para el chunk VP8X.
    //   Las leemos del chunk VP8 o VP8L existente.
    let canvasWidth = 512, canvasHeight = 512; // fallback seguro

    let scanOffset = 12;
    while (scanOffset + 8 <= webpBuffer.length) {
      const fc   = webpBuffer.slice(scanOffset, scanOffset + 4).toString('ascii');
      const csz  = webpBuffer.readUInt32LE(scanOffset + 4);
      if (fc === 'VP8 ' && scanOffset + 10 + 4 <= webpBuffer.length) {
        // VP8 bitstream: bytes 6-7 son width-1, bytes 8-9 son height-1 (en el bitframe)
        // Los primeros 3 bytes del payload son el frame tag.
        // Width/Height están en los bytes 6 y 8 del payload (little-endian 14-bit).
        const p = scanOffset + 8; // inicio del payload VP8
        if (p + 10 <= webpBuffer.length) {
          canvasWidth  = ((webpBuffer[p + 7] & 0x3F) << 8 | webpBuffer[p + 6]) & 0x3FFF;
          canvasHeight = ((webpBuffer[p + 9] & 0x3F) << 8 | webpBuffer[p + 8]) & 0x3FFF;
          if (canvasWidth  === 0) canvasWidth  = 512;
          if (canvasHeight === 0) canvasHeight = 512;
        }
        break;
      }
      if (fc === 'VP8L' && scanOffset + 8 + 5 <= webpBuffer.length) {
        // VP8L: byte 0 del payload = 0x2F (signature), luego 28 bits con width-1 y height-1
        const p = scanOffset + 8;
        if (webpBuffer[p] === 0x2F) {
          const bits  = webpBuffer.readUInt32LE(p + 1);
          canvasWidth  = (bits & 0x3FFF) + 1;
          canvasHeight = ((bits >> 14) & 0x3FFF) + 1;
        }
        break;
      }
      scanOffset += 8 + csz + (csz % 2);
    }

    // Construir el chunk VP8X (10 bytes de payload)
    //   flags: bit2=ICCP, bit3=EXIF, bit4=XMP, bit5=Animation, bit1=Alpha
    //   Activamos solo bit3 (EXIF) → 0x08
    const vp8xPayload = Buffer.alloc(10);
    vp8xPayload[0] = 0x08; // flags: EXIF present
    // canvas width  stored as (width  - 1) en 24 bits LE
    vp8xPayload.writeUIntLE(canvasWidth  - 1, 4, 3);
    // canvas height stored as (height - 1) en 24 bits LE
    vp8xPayload.writeUIntLE(canvasHeight - 1, 7, 3);

    const vp8xChunk = Buffer.concat([
      Buffer.from('VP8X', 'ascii'),
      Buffer.from([0x0A, 0x00, 0x00, 0x00]), // tamaño del payload = 10 (0x0A)
      vp8xPayload,
    ]);

    // Reconstruir: RIFF header (12 bytes) + VP8X + chunks originales (sin los 12 de cabecera) + EXIF
    const originalChunks = webpBuffer.slice(12);
    newBody = Buffer.concat([
      webpBuffer.slice(0, 12), // "RIFF" + size_placeholder + "WEBP"
      vp8xChunk,
      originalChunks,
      exifChunk,
    ]);
  }

  // ── 5. Actualizar el tamaño RIFF (bytes 4-7) ────────────────────────────
  // El tamaño RIFF = longitud total del archivo - 8 (no cuenta "RIFF" ni el propio campo size)
  newBody.writeUInt32LE(newBody.length - 8, 4);

  return newBody;
}
