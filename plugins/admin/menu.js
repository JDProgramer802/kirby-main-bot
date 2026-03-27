// @nombre: menu
// @alias: menu, help, comandos, lista, ayu
// @categoria: admin
// @descripcion: Muestra la lista completa de comandos categorizados del bot. Usa /menu [categoria] para ver solo una categoría.
// @reaccion: ✿

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import config from '../../src/lib/config.js';
import { getBotConfig, query, obtenerGrupo } from '../../src/lib/database.js';

// ─── Utilidades Locales de Tipografía ───────────────────────────────
const toKawaii = (str) => {
  const map = {
    'a': 'α', 'b': 'в', 'c': '¢', 'd': '∂', 'e': 'є', 'f': 'ƒ', 'g': 'g', 'h': 'н', 'i': 'ι', 'j': 'נ', 'k': 'к', 'l': 'ℓ', 'm': 'м', 'n': 'η', 'o': 'σ', 'p': 'ρ', 'q': 'ף', 'r': 'я', 's': 'ѕ', 't': 'т', 'u': 'υ', 'v': 'ν', 'w': 'ω', 'x': 'χ', 'y': 'у', 'z': 'z'
  };
  return str.toLowerCase().split('').map(c => map[c] || c).join('');
};

const toBubble = (str) => {
  const map = {
    'A': 'Ⓐ', 'B': 'Ⓑ', 'C': 'Ⓒ', 'D': 'Ⓓ', 'E': 'Ⓔ', 'F': 'Ⓕ', 'G': 'Ⓖ', 'H': 'Ⓗ', 'I': 'Ⓘ', 'J': 'Ⓙ', 'K': 'Ⓚ', 'L': 'Ⓛ', 'M': 'Ⓜ', 'N': 'Ⓝ', 'O': 'Ⓞ', 'P': 'Ⓟ', 'Q': 'Ⓠ', 'R': 'Ⓡ', 'S': 'Ⓢ', 'T': 'Ⓣ', 'U': 'Ⓤ', 'V': 'Ⓥ', 'W': 'Ⓦ', 'X': 'Ⓧ', 'Y': 'Ⓨ', 'Z': 'Ⓩ',
    'a': 'ⓐ', 'b': 'ⓑ', 'c': 'ⓒ', 'd': 'ⓓ', 'e': 'ⓔ', 'f': 'ⓕ', 'g': 'ⓖ', 'h': 'ⓗ', 'i': 'ⓘ', 'j': 'ⓙ', 'k': 'ⓚ', 'l': 'ⓛ', 'm': 'ⓜ', 'n': 'ⓝ', 'o': 'ⓞ', 'p': 'ⓟ', 'q': 'ⓠ', 'r': 'ⓡ', 's': 'ⓢ', 't': 'ⓣ', 'u': 'ⓤ', 'v': 'ⓥ', 'w': 'ⓦ', 'x': 'ⓧ', 'y': 'ⓨ', 'z': 'ⓩ'
  };
  return str.split('').map(c => map[c] || c).join('');
};

const toSmallCaps = (str) => {
  const map = {
    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 'ꜱ', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
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

const toScript = (str) => {
  const map = {
    'A': '𝓐', 'B': '𝓑', 'C': '𝓒', 'D': '𝓓', 'E': '𝓔', 'F': '𝓕', 'G': '𝓖', 'H': '𝓗', 'I': '𝓘', 'J': '𝓙', 'K': '𝓚', 'L': '𝓛', 'M': '𝓜', 'N': '𝓝', 'O': '𝓞', 'P': '𝓟', 'Q': '𝓠', 'R': '𝓡', 'S': '𝓢', 'T': '𝓣', 'U': '𝓤', 'V': '𝓥', 'W': '𝓦', 'X': '𝓧', 'Y': '𝓨', 'Z': '𝓩',
    'a': '𝓪', 'b': '𝓫', 'c': '𝓬', 'd': '𝓭', 'e': '𝓮', 'f': '𝓯', 'g': '𝓰', 'h': '𝓱', 'i': '𝓲', 'j': '𝓳', 'k': '𝓴', 'l': '𝓵', 'm': '𝓶', 'n': '𝓷', 'o': '𝓸', 'p': '𝓹', 'q': '𝓺', 'r': '𝓻', 's': '𝓼', 't': '𝓽', 'u': '𝓾', 'v': '𝓿', 'w': '𝔀', 'x': '𝔁', 'y': '𝔂', 'z': '𝔃'
  };
  return str.split('').map(c => map[c] || c).join('');
};

const CAT_ICONS = {
  admin: '🍥',
  subbots: '🤖',
  descargas: '☁️',
  utilidad: '🎀',
  diversion: '🍭',
  nsfw: '🔞',
  grupos: '🫂',
  info: '📖',
  otros: '🌟',
};

const splitLongText = (text, maxLen = 3000) => {
  const parts = [];
  let start = 0;
  while (start < text.length) {
    parts.push(text.slice(start, start + maxLen));
    start += maxLen;
  }
  return parts;
};

export default async function (m, { conn, sender, plugins, prefijo, isGroup }) {
  const text = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
  const args = text.split(' ').slice(1);
  const categoriaSolicitada = args[0]?.toLowerCase();

  const categorias = {};
  let totalCmds = 0;

  plugins.forEach((plu) => {
    const cat = (plu.categoria || 'otros').toLowerCase();
    if (!categorias[cat]) categorias[cat] = [];

    const existe = categorias[cat].find(c => c.nombre === plu.nombre);
    if (!existe && plu.nombre) {
      categorias[cat].push({
        nombre: plu.nombre,
        alias: Array.isArray(plu.alias) ? plu.alias : [],
        descripcion: plu.descripcion || 'Sin descripción',
      });
      totalCmds++;
    }
  });

  // Obtener información del grupo si está en uno
  let grupoInfo = null;
  if (isGroup) {
    try {
      grupoInfo = await obtenerGrupo(m.key.remoteJid);
    } catch (e) {
      console.log('No se pudo obtener información del grupo:', e.message);
    }
  }

  try {
    const catsOrdenadas = Object.keys(categorias).sort();
    const fecha = new Date().toLocaleDateString('es-CO', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    const isSubbot = conn.isSubbot;
    const botType = isSubbot ? 'subbot' : 'main bot';

    let botNombreActual = config.botNombre;
    if (isSubbot) {
      try {
        const myJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        const myLid = conn.user.lid || '';
        const res = await query("SELECT nombre FROM subbots WHERE jid = $1 OR jid = $2", [myJid, myLid]);
        if (res.rows[0]?.nombre) botNombreActual = res.rows[0].nombre;
        else botNombreActual = conn.user.name || config.botNombre;
      } catch (e) {
        botNombreActual = conn.user.name || config.botNombre;
      }
    }

    // ─── DISEÑO KIRBY STAR GUARDIAN (ANIME CUTE UNIQUE) ─────────────
    const ejecutor = m.pushName || 'Amig@';

    // ✅ FIX: Declarar ANTES de usar en txt
    let categoriasAMostrar = catsOrdenadas;
    let cmdsEnCategoria = totalCmds;
    let categoriaNoEncontrada = false;

    if (categoriaSolicitada) {
      if (catsOrdenadas.includes(categoriaSolicitada)) {
        categoriasAMostrar = [categoriaSolicitada];
        cmdsEnCategoria = categorias[categoriaSolicitada].length;
      } else {
        categoriaNoEncontrada = true;
      }
    }

    let txt = '';
    txt += `  ⊹ ˚ ꒷ꕤ ദ ${toBoldSerif(botNombreActual)} ෴\n`;
    txt += `  ★ ${toSmallCaps('¡bienvenido a la aventura estelar!')} ✨\n\n`;

    txt += `  ⊹ ─── ⋆ ✦ ⋆ ─── ⊹\n`;
    txt += `  ✧ ${toSmallCaps('ᴄʀᴇᴀᴅᴏʀ')}  :: ${toScript('dev kirby')}\n`;
    txt += `  ✧ ${toSmallCaps('ᴘʀᴇꜰɪᴊᴏ')}  :: ${prefijo}\n`;
    txt += `  ✧ ${toSmallCaps('ᴄᴍᴅꜱ')}     :: ${cmdsEnCategoria}\n`;
    txt += `  ✧ ${toSmallCaps('ᴍᴏᴅᴏ')}     ⇢ ${toSmallCaps(botType)}\n`;
    txt += `  ✧ ${toSmallCaps('ꜰᴇᴄʜᴀ')}    ⇢ ${fecha}\n`;
    txt += `  ⊹ ─── ⋆ ✦ ⋆ ─── ⊹\n\n`;

    // ─── SECCIÓN DE BANNERS DEL GRUPO ─────────────────────────────
    if (isGroup && grupoInfo) {
      txt += `  🌸 *${toBoldSerif('Banners del Grupo')}* 🌸\n`;
      txt += `  ⊹ ─── ⋆ ✦ ⋆ ─── ⊹\n`;
      
      if (grupoInfo.banner_bienvenida) {
        txt += `  ✦ ${toSmallCaps('ʙᴀɴɴᴇʀ ʙɪᴇɴᴠᴇɴɪᴅᴀ')} :: ✅ ᴄᴏɴꜰɪɢᴜʀᴀᴅᴏ\n`;
      } else {
        txt += `  ✦ ${toSmallCaps('ʙᴀɴɴᴇʀ ʙɪᴇɴᴠᴇɴɪᴅᴀ')} :: ❌ ꜱɪɴ ᴄᴏɴꜰɪɢᴜʀᴀʀ\n`;
      }
      
      if (grupoInfo.banner_despedida) {
        txt += `  ✦ ${toSmallCaps('ʙᴀɴɴᴇʀ ᴅᴇꜱᴘᴇᴅɪᴅᴀ')} :: ✅ ᴄᴏɴꜰɪɢᴜʀᴀᴅᴏ\n`;
      } else {
        txt += `  ✦ ${toSmallCaps('ʙᴀɴɴᴇʀ ᴅᴇꜱᴘᴇᴅɪᴅᴀ')} :: ❌ ꜱɪɴ ᴄᴏɴꜰɪɢᴜʀᴀʀ\n`;
      }
      
      txt += `  ⊹ ─── ⋆ ✦ ⋆ ─── ⊹\n\n`;
    }

    txt += `  ⋆ ᴄᴀɴᴀʟ ᴏғɪᴄɪᴀʟ ⋆\n`;
    txt += `  ╰┈➤ https://whatsapp.com/channel/0029Vb7j8h3ADTOKGmHrfD1X\n\n`;

    const CAT_DESCS = {
      admin: 'ɢᴇꜱᴛɪᴏɴᴀ ᴇʟ ɢʀᴜᴘᴏ ʏ ᴇʟ ʙᴏᴛ ✿',
      subbots: 'ᴄʀᴇᴀ ʏ ɢᴇꜱᴛɪᴏɴᴀ ᴛᴜꜱ ᴘʀᴏᴘɪᴏꜱ ʙᴏᴛꜱ ✧',
      descargas: 'ʙᴀᴊᴀ ᴄᴏꜱɪᴛᴀꜱ ᴅᴇ ʀᴇᴅᴇꜱ ✿',
      utilidad: 'ʜᴇʀʀᴀᴍɪᴇɴᴛᴀꜱ ᴜᴛɪʟᴇꜱ ʏ ʀᴀᴘɪᴅᴀꜱ ✧',
      diversion: 'ᴊᴜᴇɢᴀ ʏ ᴅɪᴠɪᴇʀᴛᴇᴛᴇ ᴄᴏɴ ᴀᴍɪɢᴏꜱ ✿',
      nsfw: 'ᴄᴏɴᴛᴇɴɪᴅᴏ ᴘɪᴄᴀɴᴛᴇ (+18) 🔞',
      grupos: 'ᴀᴊᴜꜱᴛᴇꜱ ᴘᴀʀᴀ ᴛᴜ ᴄᴏᴍᴜɴɪᴅᴀᴅ ✧',
      info: 'ɪɴꜰᴏʀᴍᴀᴄɪᴏɴ ꜱᴏʙʀᴇ ᴇʟ ꜱᴀɴᴛᴜᴀʀɪᴏ ✿',
      otros: 'ᴏᴛʀᴏꜱ ᴄᴏᴍᴀɴᴅᴏꜱ ᴍᴀɢɪᴄᴏꜱ ✧',
      economia: 'ɢᴀɴᴀ ᴄᴏɪɴꜱ ʏ ᴊᴜᴇɢᴀ ꜱᴜᴀᴠᴇ ✿',
      gacha: 'ᴄᴏʟᴇᴄᴄɪᴏɴᴀ ʏ ʀᴇᴄʟᴀᴍᴀ ᴡᴀɪꜰᴜꜱ ✧',
      anime: 'ʀᴇᴀᴄᴄɪᴏɴᴇꜱ ᴅᴇ ᴀɴɪᴍᴇ ᴄᴜᴛᴇ ✿',
      perfiles: 'ᴍɪʀᴀ ʏ ᴇᴅɪᴛᴀ ᴛᴜ ᴘᴇʀꜰɪʟ ✧'
    };

    // Mensaje de error si la categoría no existe
    if (categoriaNoEncontrada) {
      txt += `  ❌ *Categoría no encontrada:* ${categoriaSolicitada}\n\n`;
      txt += `  📋 *Categorías disponibles:*\n`;
      catsOrdenadas.forEach(cat => {
        txt += `  • ${cat.charAt(0).toUpperCase() + cat.slice(1)}\n`;
      });
      txt += `\n  💡 *Uso:* ${prefijo}menu [categoría]\n`;
      txt += `  💡 *Ejemplo:* ${prefijo}menu admin\n\n`;
    }

    // ─── CATEGORÍAS DINÁMICAS (POYO STYLE) ───────────────────
    for (const cat of categoriasAMostrar) {
      const desc = CAT_DESCS[cat] || 'ᴄᴏᴍᴀɴᴅᴏꜱ ᴅᴇʟ ꜱᴀɴᴛᴜᴀʀɪᴏ ✿';

      txt += `  ⊹ ─ ⊹ ─ ⊹\n\n`;
      txt += `  » ✦ *${toBoldSerif(cat.charAt(0).toUpperCase() + cat.slice(1))}* ✦\n`;
      txt += `  > _${desc}_\n\n`;

      const cmds = categorias[cat].sort((a, b) => a.nombre.localeCompare(b.nombre));

      for (const cmd of cmds) {
        txt += `  ⋆ *${cmd.nombre.toLowerCase()}*\n`;

        let cmdLine = `    ➜ \`${prefijo}${cmd.nombre.toLowerCase()}\``;
        if (cmd.alias && cmd.alias.length > 1) {
          cmdLine += ` ${cmd.alias.slice(1).map(a => `\`${prefijo}${a}\``).join(' ')}`;
        }
        txt += `${cmdLine}\n`;

        const descFinal = cmd.descripcion || 'Sin descripción';
        txt += `    _${toSmallCaps(descFinal)}_\n\n`;
      }
    }

    txt += `  ⊹ ─ ⊹ ─ ⊹\n`;
    txt += `    *~ poyo poyo ~*\n\n`;

    txt += `  (๑✧◡✧๑) ${toScript(botNombreActual)}\n`;
    txt += `  ${toSmallCaps('ᴄʀᴀꜰᴛᴇᴅ ᴡɪᴛʜ ʜᴇᴀʀᴛ')} ✧`;

    // --- Lógica de Banner Dinámico ---
    let bannerUrl = await getBotConfig('banner_menu');

    if (conn.isSubbot) {
      try {
        const jidSubbot = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        const res = await query("SELECT banner FROM subbots WHERE jid = $1", [jidSubbot]);
        if (res.rows[0]?.banner) bannerUrl = res.rows[0].banner;
      } catch (e) {}
    }

    const ppUrl = bannerUrl || './src/assets/menu_kirby.png';
    const isUrl = ppUrl.startsWith('http');
    const isVideo = isUrl && (ppUrl.endsWith('.mp4') || ppUrl.endsWith('.mov') || ppUrl.endsWith('.avi'));

    let finalBuffer;
    try {
      if (isUrl) {
        const response = await axios.get(ppUrl, { responseType: 'arraybuffer' });
        finalBuffer = Buffer.from(response.data);
      } else {
        finalBuffer = fs.readFileSync(path.resolve(ppUrl));
      }
    } catch (e) {
      finalBuffer = fs.readFileSync(path.resolve('./src/assets/menu_kirby.png'));
    }

    await conn.sendMessage(m.key.remoteJid, {
      image: finalBuffer,
      caption: txt,
      mentions: [sender]
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    try {
      await conn.sendMessage(m.key.remoteJid, { text: '(>_<) ᴇʀʀᴏʀ ᴇɴ ᴇʟ sɪsᴛᴇᴍᴀ' }, { quoted: m });
    } catch (e2) {}
  }
}
