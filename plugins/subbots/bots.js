// @nombre: bots
// @alias: subbots, listbots
// @categoria: subbots
// @descripcion: Listar todos los bots y sub-bots activos en este grupo.
// @reaccion: 🤖

import fs from 'fs';
import path from 'path';
import { query } from '../../src/lib/database.js';

// ─── TIPOGRAFÍAS KAWAII (AUTÓNOMAS) ───────────────────────────────────────────
const toSmallCaps = (str) => {
  const map = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ',
    k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'Q', r: 'ʀ', s: 'ꜱ', t: 'ᴛ',
    u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
  };
  return str.toLowerCase().split('').map(c => map[c] || c).join('');
};

const toBoldSerif = (str) => {
  const map = {
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳'
  };
  return str.split('').map(c => map[c] || c).join('');
};

const toBubble = (str) => {
  const map = {
    'A': 'Ⓐ', 'B': 'Ⓑ', 'C': 'Ⓒ', 'D': 'Ⓓ', 'E': 'Ⓔ', 'F': 'Ⓕ', 'G': 'Ⓖ', 'H': 'Ⓗ', 'I': 'Ⓘ', 'J': 'Ⓙ', 'K': 'Ⓚ', 'L': 'Ⓛ', 'M': 'Ⓜ', 'N': 'Ⓝ', 'O': 'Ⓞ', 'P': 'Ⓟ', 'Q': 'Ⓠ', 'R': 'Ⓡ', 'S': 'Ⓢ', 'T': 'Ⓣ', 'U': 'Ⓤ', 'V': 'Ⓥ', 'W': 'Ⓦ', 'X': 'Ⓧ', 'Y': 'Ⓨ', 'Z': 'Ⓩ',
    'a': 'ⓐ', 'b': 'ⓑ', 'c': 'ⓒ', 'd': 'ⓓ', 'e': 'ⓔ', 'f': 'ⓕ', 'g': 'ⓖ', 'h': 'ⓗ', 'i': 'ⓘ', 'j': 'ⓙ', 'k': 'ⓚ', 'l': 'ⓛ', 'm': 'ⓜ', 'n': 'ⓝ', 'o': 'ⓞ', 'p': 'ⓟ', 'q': 'ⓠ', 'r': 'ⓡ', 's': 'ⓢ', 't': 'ⓣ', 'u': 'ⓤ', 'v': 'ⓥ', 'w': 'ⓦ', 'x': 'ⓧ', 'y': 'ⓨ', 'z': 'ⓩ'
  };
  return str.split('').map(c => map[c] || c).join('');
};

// ─── PLUGIN ──────────────────────────────────────────────────────────────────
export default async function(m, ctx) {
  const { conn, isGroup, reply, sender } = ctx;
  const remoteJid = m.key.remoteJid;

  try {
    const res = await query("SELECT jid, jid_owner, nombre, estado FROM subbots");
    const todosLosBots = res.rows;
    const subbotsConectados = todosLosBots.filter(b => b.estado === 'conectado');
    const myJid = conn.user?.id ? (conn.user.id.split(':')[0] + '@s.whatsapp.net') : null;

    let txt = `✩━━━━━━━━━━━━━━━✩\n`;
    txt += `  ☾  ${toBoldSerif('Kirby Dream')}  ☽\n`;
    txt += `  『 ${toSmallCaps('system monitor')} 』\n`;
    txt += `✩━━━━━━━━━━━━━━━✩\n\n`;

    txt += `✦ ${toSmallCaps('estadisticas')} ✦\n`;
    txt += `  ⊹ Principal: 1\n`;
    txt += `  ⊹ Sub-Bots: ${subbotsConectados.length}\n`;
    txt += `  ⊹ Total: ${1 + subbotsConectados.length}\n\n`;

    if (myJid) {
      txt += `⊱ ✩ ──────────── ✩ ⊰\n`;
      txt += ` 『 ${toSmallCaps('sesion actual')} 』\n`;
      txt += `  @${myJid.split('@')[0]}\n`;
      txt += `⊱ ✩ ──────────── ✩ ⊰\n\n`;
    }

    if (subbotsConectados.length > 0) {
      txt += `${toBubble('Sistemas Activos')}\n`;

      subbotsConectados.forEach((s, i) => {
        const isMe = s.jid === myJid;
        const status = isMe ? ` ✩` : '';
        txt += `\n ┌──『 ${toBoldSerif(s.nombre || 'Kirby Bot')} 』\n`;
        txt += ` ┆  ID: @${s.jid.split('@')[0]}${status}\n`;
        txt += ` ┆  Owner: @${s.jid_owner?.split('@')[0] || '---'}\n`;
        txt += ` └━━━━━━━━━━━━━━━✩\n`;
      });
    }

    txt += `\n⊱ ✧ ──────────── ✧ ⊰\n`;
    txt += ` 『 ${toSmallCaps('dreamland vip system')} 』\n`;
    txt += `⊱ ✧ ──────────── ✧ ⊰`;

    const mentions = subbotsConectados.map(s => s.jid).concat(subbotsConectados.map(s => s.jid_owner));
    if (myJid) mentions.push(myJid);

    // 🎨 Recursos de diseño
    const assetsDir = path.join(process.cwd(), 'src', 'assets');
    const menuPath = path.join(assetsDir, 'menu_kirby.png');
    const faviconPath = path.join(assetsDir, 'favicon.ico');

    const menuBuffer = fs.existsSync(menuPath) ? fs.readFileSync(menuPath) : null;
    const faviconBuffer = fs.existsSync(faviconPath) ? fs.readFileSync(faviconPath) : null;

    // Enviar como imagen (para que sea grande) con un Ad Reply (para el favicon y link)
    if (menuBuffer) {
      await conn.sendMessage(remoteJid, {
        image: menuBuffer,
        caption: txt,
        mentions: mentions.filter(m => m && m.includes('@')),
        contextInfo: {
          externalAdReply: {
            title: 'Kirby Dream System',
            body: '☾  system monitor  ☽',
            thumbnail: faviconBuffer,
            mediaType: 1,
            renderLargerThumbnail: false, // ✩ Pequeño a la derecha ✩
            sourceUrl: 'https://github.com/DreamKirbyDeveloper/kirby-pro' // ✩ El link estilizado ✩
          }
        }
      }, { quoted: m });
    } else {
      // Fallback a texto si no hay imagen
      await conn.sendMessage(remoteJid, {
        text: txt,
        mentions: mentions.filter(m => m && m.includes('@')),
        contextInfo: {
          externalAdReply: {
            title: 'Kirby Dream System',
            body: '☾  system monitor  ☽',
            thumbnail: faviconBuffer,
            mediaType: 1,
            renderLargerThumbnail: false,
            sourceUrl: 'https://github.com/DreamKirbyDeveloper/kirby-pro'
          }
        }
      }, { quoted: m });
    }

  } catch (e) {
    console.error('Error en plugin bots:', e);
    await reply(`(>_<) ${toSmallCaps('error fatal')}: ${e.message}`);
  }
}
