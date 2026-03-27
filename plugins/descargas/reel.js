// @nombre: reel
// @alias: reel, ig, instagram
// @categoria: descargas
// @descripcion: Descarga un Reel / Video o foto de Instagram. (Uso: /ig [Enlace])

import YTDlpWrapPkg from 'yt-dlp-wrap';
const YTDlpWrap = YTDlpWrapPkg.default;

export default async function (m, { conn, text, reply }) {
  if (!text) return reply('⚠️ *¡Ay!* Necesito el enlace del Reel/Post de Instagram.\n`Ejemplo: /ig https://instagram.com/p/...` 🌸');
  if (!text.includes('instagram.com')) return reply('❌ *Uh oh...* Ese no parece un enlace válido de Instagram. 🥺');

  reply('☁️ ✨ _Preparando la cámara rosada..._ 📸');

  // Indicar que está procesando
  await conn.sendPresenceUpdate('composing', m.key.remoteJid);

  try {
    const ytDlpWrap = new YTDlpWrap();
    const videoInfo = await ytDlpWrap.getVideoInfo(text);

    if (!videoInfo || !videoInfo.formats || videoInfo.formats.length === 0) {
      return reply('❌ *Aww...* No pude obtener la publicación. Quizá la cuenta es privada o el link caducó. 😿');
    }

    const formats = videoInfo.formats.filter(f => f.vcodec !== 'none' && f.acodec !== 'none');
    const bestFormat = formats.sort((a, b) => (b.height || 0) - (a.height || 0))[0];

    if (!bestFormat || !bestFormat.url) {
      return reply('❌ *Uh oh.* La publicación no tiene medios para descargar.');
    }

    let txt = `╭ ꒰ 📸 𝓘𝓷𝓼𝓽𝓪𝓰𝓻𝓪𝓶 𝓚𝓪𝔀𝓪𝓲𝓲 📸 ꒱\n`;
    txt += `┊ ✨ ¡Post extraído con éxito!\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    await conn.sendMessage(m.key.remoteJid, {
      video: { url: bestFormat.url },
      caption: txt
    }, { quoted: m });

    // Indicar que terminó
    await conn.sendPresenceUpdate('available', m.key.remoteJid);

  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El carrete de la cámara se desenfocó. 😭');
    await conn.sendPresenceUpdate('available', m.key.remoteJid);
  }
}
