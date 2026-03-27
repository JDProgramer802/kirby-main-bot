// @nombre: mediafire
// @alias: mediafire, mf
// @categoria: descargas
// @descripcion: Obtiene información y el enlace de descarga directo de un archivo de MediaFire. (Uso: /mf [Enlace])

import YTDlpWrapPkg from 'yt-dlp-wrap';
const YTDlpWrap = YTDlpWrapPkg.default;

export default async function (m, { conn, text, reply }) {
  if (!text) return reply('⚠️ *¡Ay!* Necesito el enlace de MediaFire. `Ejemplo: /mf https://mediafire.com/...` 🌸');
  if (!text.includes('mediafire.com')) return reply('❌ *Uh oh...* Ese no parece un enlace de MediaFire. 🥺');

  reply('☁️ ✨ _Desenredando el archivo..._ 🗃️');

  // Indicar que está procesando
  await conn.sendPresenceUpdate('composing', m.key.remoteJid);

  try {
    const ytDlpWrap = new YTDlpWrap();
    const videoInfo = await ytDlpWrap.getVideoInfo(text);

    if (!videoInfo || !videoInfo.formats || videoInfo.formats.length === 0) {
       return reply('❌ *Aww...* No pude obtener el archivo. Quizá es inválido o se borró. 😿');
    }

    const bestFormat = videoInfo.formats[0]; // Para archivos, tomar el primero

    if (!bestFormat || !bestFormat.url) {
       return reply('❌ *Aww...* No pude obtener el enlace de descarga.');
    }

    let txt = `╭ ꒰ 🔥 𝓜𝓮𝓭𝓲𝓪𝓕𝓲𝓻𝓮 𝓚𝓪𝔀𝓪𝓲𝓲 🔥 ꒱\n`;
    txt += `┊ 📄 *Nombre:* ${videoInfo.title || 'Archivo'}\n`;
    txt += `┊ ⚖️ *Peso:* ${bestFormat.filesize ? (bestFormat.filesize / (1024 * 1024)).toFixed(2) + ' MB' : '?'}\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕\n`;
    txt += `✨ _Enviando documento... si no llega, pesa mucho para WhatsApp._`;
    reply(txt);

    // Intentar pasarlo como documento general
    await conn.sendMessage(m.key.remoteJid, {
      document: { url: bestFormat.url },
      mimetype: 'application/octet-stream',
      fileName: videoInfo.title || 'archivo_mediafire'
    }, { quoted: m });

    // Indicar que terminó
    await conn.sendPresenceUpdate('available', m.key.remoteJid);

  } catch (err) {
    console.error(err);
    reply('❌ *Oh no...* El archivo pesaba demasiado o el link expiró.');
    await conn.sendPresenceUpdate('available', m.key.remoteJid);
  }
}
