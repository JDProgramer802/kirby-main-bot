// @nombre: facebook
// @alias: facebook, fb, fbdl
// @categoria: descargas
// @descripcion: Descarga un video de Facebook. (Uso: /fb [Enlace])

import YTDlpWrapPkg from 'yt-dlp-wrap';
const YTDlpWrap = YTDlpWrapPkg.default;

export default async function (m, { conn, text, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Pásame el enlace de Facebook.\n`Ejemplo: /fb https://facebook.com/...` 🌸');
  }

  if (!text.includes('facebook.com') && !text.includes('fb.watch')) {
    return reply('❌ *Uh oh...* Ese enlace no parece de Facebook. 🥺');
  }

  reply('☁️ ✨ _Navegando en el muro..._ 📖');

  // Indicar que está procesando
  await conn.sendPresenceUpdate('composing', m.key.remoteJid);

  try {
    const ytDlpWrap = new YTDlpWrap();
    const videoInfo = await ytDlpWrap.getVideoInfo(text);

    if (!videoInfo || !videoInfo.formats || videoInfo.formats.length === 0) {
      return reply('❌ *Aww...* No pude obtener el video. Quizá es un grupo privado o la API falló. 😿');
    }

    const formats = videoInfo.formats.filter(f => f.vcodec !== 'none' && f.acodec !== 'none');
    const bestFormat = formats.sort((a, b) => (b.height || 0) - (a.height || 0))[0];

    if (!bestFormat || !bestFormat.url) {
      return reply('❌ *Aww...* No pude encontrar una URL válida para el video.');
    }

    let txt = `╭ ꒰ 📘 𝓕𝓪𝓬𝓮𝓫𝓸𝓸𝓴 𝓚𝓪𝔀𝓪𝓲𝓲 📘 ꒱\n`;
    txt += `┊ 🎬 *Título:* ${videoInfo.title || 'Video sin título'}\n`;
    txt += `┊ ✨ ¡Extraído del muro justito para ti!\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    await conn.sendMessage(m.key.remoteJid, {
      video: { url: bestFormat.url },
      caption: txt
    }, { quoted: m });

    // Indicar que terminó
    await conn.sendPresenceUpdate('available', m.key.remoteJid);

  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Zuckerberg escondió el video antes de que pudiera robarlo.');
    await conn.sendPresenceUpdate('available', m.key.remoteJid);
  }
}
