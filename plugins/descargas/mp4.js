// @nombre: mp4
// @alias: mp4, video, ytvideo
// @categoria: descargas
// @descripcion: Descarga un video de YouTube o muestra resultados de búsqueda de YouTube para descargar. (Uso: /mp4 [Enlace o Búsqueda])

import yts from 'yt-search';
import fs from 'fs';
import { downloadYT } from '../../src/lib/ytdlp.js';

export default async function (m, { conn, text, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime qué video quieres ver. `Ejemplo: /mp4 Kirby Gourmet Race` 🌸');
  }

  reply('☁️ ✨ _Procesando cinta de video con yt-dlp..._ 🎬');

  try {
    let videoUrl = text;
    if (!text.includes('youtu')) {
      const search = await yts(text);
      const results = search.videos;
      if (!results || results.length === 0) {
        return reply(`❌ *Aww...* No encontré nada llamado "${text}". 😿`);
      }
      videoUrl = results[0].url;
    }

    // Simular que está escribiendo/procesando
    await conn.sendPresenceUpdate('composing', m.key.remoteJid);

    // Descarga local
    const { path: filePath, title } = await downloadYT(videoUrl, 'mp4');

    let txt = `╭ ꒰ 📺 𝓥𝓲𝓭𝓮𝓸 𝓟𝓻𝓮𝓶𝓲𝓾m 📺 ꒱\n`;
    txt += `┊ 🎬 *Título:* ${title}\n`;
    txt += `┊ ✨ _Espero que traigas las palomitas..._\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    await conn.sendMessage(m.key.remoteJid, {
      video: { url: filePath },
      mimetype: 'video/mp4',
      caption: txt
    }, { quoted: m });

    // Detener presencia
    await conn.sendPresenceUpdate('paused', m.key.remoteJid);

    // Borrar temporal
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  } catch (err) {
    console.error(err);
    reply('❌ *Oh no...* El video era muy pesado o hubo un error en el procesamiento con FFmpeg.');
  }
}
