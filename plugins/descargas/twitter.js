// @nombre: twitter
// @alias: twitter, tw, x
// @categoria: descargas
// @descripcion: Descarga un video de Twitter/X. (Uso: /tw [Enlace])

import YTDlpWrapPkg from 'yt-dlp-wrap';
const YTDlpWrap = YTDlpWrapPkg.default;

export default async function (m, { conn, text, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Necesito el enlace del Tweet.\n`Ejemplo: /tw https://x.com/...` 🌸');
  }

  if (!text.includes('twitter.com') && !text.includes('x.com')) {
    return reply('❌ *Uh oh...* Ese no parece un enlace válido de Twitter/X. 🥺');
  }

  reply('☁️ ✨ _Cazando pajaritos azules..._ 🐦');

  // Indicar que está procesando
  await conn.sendPresenceUpdate('composing', m.key.remoteJid);

  try {
    const ytDlpWrap = new YTDlpWrap();
    const videoInfo = await ytDlpWrap.getVideoInfo(text);

    if (!videoInfo || !videoInfo.formats || videoInfo.formats.length === 0) {
      return reply('❌ *Aww...* No pude obtener el video. Quizá es privado o no contiene multimedia. 😿');
    }

    // Elegir la mejor calidad (preferir video con audio)
    const formats = videoInfo.formats.filter(f => f.vcodec !== 'none' && f.acodec !== 'none');
    const bestFormat = formats.sort((a, b) => (b.height || 0) - (a.height || 0))[0];

    if (!bestFormat || !bestFormat.url) {
      return reply('❌ *Aww...* No pude encontrar una URL válida para el video.');
    }

    let txt = `╭ ꒰ 🐦 𝓣𝔀𝓲𝓽𝓽𝓮𝓻 𝓚𝓪𝔀𝓪𝓲𝓲 🐦 ꒱\n`;
    txt += `┊ ✨ ¡Video capturado con éxito!\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    await conn.sendMessage(m.key.remoteJid, {
      video: { url: bestFormat.url },
      caption: txt
    }, { quoted: m });

    // Indicar que terminó
    await conn.sendPresenceUpdate('available', m.key.remoteJid);

  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El pajarito voló antes de que pudiera atrapar el video.');
    await conn.sendPresenceUpdate('available', m.key.remoteJid);
  }
}
