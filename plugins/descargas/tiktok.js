// @nombre: tiktok
// @alias: tiktok, tt, ttdl
// @categoria: descargas
// @descripcion: Descarga un video de TikTok sin marca de agua. (Uso: /tt [Enlace])

import axios from 'axios';

export default async function (m, { conn, text, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Pásame el enlace del TikTok que quieres descargar.\n`Ejemplo: /tt https://vm.tiktok.com/...` 🌸');
  }

  if (!text.includes('tiktok.com')) {
    return reply('❌ *Uh oh...* Ese enlace no parece de TikTok. 🥺');
  }

  reply('☁️ ✨ _Preparando las palomitas..._ 🍿');

  try {
    const apiUrl = `https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(text)}`;
    const res = await axios.get(apiUrl);

    if (!res.data?.status || !res.data?.data) {
      return reply('❌ *Aww...* No pude obtener el video. Quizá es privado o la API falló. 😿');
    }

    const videoData = res.data.data;
    const { title, play } = videoData; // En la API de Tikmate/Tiktok 'play' suele ser el mp4

    const videoUrl = play || videoData.video || videoData.download_url;

    let txt = `╭ ꒰ 📱 𝓣𝓲𝓴𝓣𝓸𝓴 𝓚𝓪𝔀𝓪𝓲𝓲 📱 ꒱\n`;
    txt += `┊ 🎬 *Título:* ${title || 'Sin título'}\n`;
    txt += `┊ ✨ _¡Sin marca de agua!_\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    await conn.sendMessage(m.key.remoteJid, {
      video: { url: videoUrl },
      caption: txt
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El carrete de cinta se atascó. Intenta luego.');
  }
}
