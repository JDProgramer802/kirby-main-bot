import fs from 'fs';
import path from 'path';

const nsfwCommands = [
  'ahegao', 'ass', 'bdsm', 'blowjob', 'cuckold', 'cum', 'ero', 'femdom', 
  'foot', 'gangbang', 'glasses', 'hentai', 'jahy', 'manga', 'masturbation', 
  'neko', 'orgy', 'panties', 'pussy', 'tentacles', 'thighs', 'yuri', 
  'zettai', 'nsfw', 'boobs', 'milf', 'paiziz', 'ecchi', 'trap', 'futanari'
];

const reactionCommands = [
  'angry', 'baka', 'bite', 'blush', 'bonk', 'bully', 'cringe', 'cry', 
  'cuddle', 'dance', 'disgust', 'feed', 'glare', 'handhold', 'happy', 
  'highfive', 'hug', 'kick', 'kiss', 'lick', 'nom', 'pat', 'poke', 
  'pout', 'punch', 'run', 'sad', 'slap', 'sleep', 'smile', 'smug', 
  'stare', 'tsundere', 'wave', 'wink', 'waifu', 'husbando', 'neko_react',
  'greet', 'cheer', 'clap', 'confused', 'facepalm', 'laugh', 'nod', 
  'nope', 'panic', 'shrug', 'sigh', 'smash', 'spin', 'sweat', 'think', 
  'vomit', 'yawn'
];

const nsfwDir = path.resolve('../plugins/nsfw');
const reacDir = path.resolve('../plugins/anime_reacciones');

if (!fs.existsSync(nsfwDir)) fs.mkdirSync(nsfwDir, { recursive: true });
if (!fs.existsSync(reacDir)) fs.mkdirSync(reacDir, { recursive: true });

// Plantilla NSFW (Requiere DB y Config check)
const nsfwTemplate = (cmd) => `// @nombre: ${cmd}
// @alias: ${cmd}
// @categoria: nsfw
// @descripcion: Envía una imagen NSFW de tipo ${cmd}.

import axios from 'axios';

export default async function (m, { conn, isGroup, dbGroup, reply }) {
  if (isGroup && !dbGroup.nsfw) {
    return reply('❌ *¡Alto ahí!* 🐷 El contenido NSFW está desactivado. Usa \`/nsfw on\`.');
  }

  reply('☁️ ✨ _Invocando la magia oscura..._ 🔞');

  try {
    const res = await axios.get('https://api.waifu.pics/nsfw/${cmd}');
    let url = res.data.url;

    if (!url) throw new Error('No URL');

    await conn.sendMessage(m.key.remoteJid, {
      image: { url },
      caption: \`╭ ꒰ 🔞 𝓝𝓢𝓕𝓦: ${cmd.toUpperCase()} 🔞 ꒱\\n┊ ✨ ¡Hechizo prohibido invocado!\\n╰━━━━━━━━━━━━━━━━━ 💕\`
    }, { quoted: m });
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El conjuro oscuro falló. Intenta de nuevo.');
  }
}
`;

// Plantilla Reacciones (Usa Waifu.pics si existe, si no usa un GIF predeterminado)
const reacTemplate = (cmd) => `// @nombre: ${cmd}
// @alias: ${cmd}
// @categoria: anime_reacciones
// @descripcion: Reacción de anime: ${cmd}.

import axios from 'axios';

export default async function (m, { conn, sender, reply }) {
  try {
    const res = await axios.get('https://api.waifu.pics/sfw/${cmd === 'neko_react' ? 'neko' : cmd}').catch(() => null);
    let url = res?.data?.url || 'https://i.ibb.co/30hS11f/kirby-default.jpg'; 

    await conn.sendMessage(m.key.remoteJid, {
      video: { url }, // Enviar como GIF si es posible, o usar image en un fallback
      gifPlayback: true,
      caption: \`╭ ꒰ 🌸 𝓡𝓮𝓪𝓬𝓬𝓲𝓸𝓷: ${cmd.toUpperCase()} 🌸 ꒱\\n┊ ✨ @\${sender.split('@')[0]} usó ${cmd}.\\n╰━━━━━━━━━━━━━━━━━ 💕\`,
      mentions: [sender]
    }, { quoted: m });
  } catch (err) {
    // Si falla envío de video (por ser jpg), lo manda como imagen
    await conn.sendMessage(m.key.remoteJid, {
      image: { url: 'https://i.ibb.co/30hS11f/kirby-default.jpg' },
      caption: \`╭ ꒰ 🌸 𝓡𝓮𝓪𝓬𝓬𝓲𝓸𝓷: ${cmd.toUpperCase()} 🌸 ꒱\\n┊ ✨ @\${sender.split('@')[0]} usó ${cmd}.\\n╰━━━━━━━━━━━━━━━━━ 💕\`
    }, { quoted: m });
  }
}
`;

nsfwCommands.forEach(cmd => {
  fs.writeFileSync(path.join(nsfwDir, cmd + '.js'), nsfwTemplate(cmd));
});

reactionCommands.forEach(cmd => {
  fs.writeFileSync(path.join(reacDir, cmd + '.js'), reacTemplate(cmd));
});

console.log('✅ Se generaron ' + nsfwCommands.length + ' comandos NSFW y ' + reactionCommands.length + ' comandos de Reacciones.');
