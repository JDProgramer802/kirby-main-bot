// @nombre: vmp
// @alias: vmp, spotify, mp3
// @categoria: descargas
// @descripcion: Descarga una canción de Spotify por nombre o enlace. (Uso: /vmp [nombre o enlace])
// @reaccion: 🎧

import axios from 'axios';
import yts from 'yt-search';
import { downloadYT } from '../../src/lib/ytdlp.js';
import fs from 'fs';

export default async function (m, { conn, text, reply, presence }) {
  if (!text) {
    return reply(
      '⚠️ *¡Ay!* Necesito el nombre de la canción o el enlace de Spotify.\n' +
      'Ejemplos:\n' +
      '`/vmp https://open.spotify.com/track/...`\n' +
      '`/vmp Bad Bunny - Neverita` 🌸'
    );
  }

  // Detectar link de Spotify
  const spotifyRegex = /(https?:\/\/open\.spotify\.com\/track\/[^\s?]+)/i;
  const match = text.match(spotifyRegex);
  let spotifyUrl = match ? match[0].split('?')[0] : null;

  reply('☁️ ✨ _Sintonizando el espectro musical... 🎵_');

  let filePath;
  try {
    await presence('recording');

    // ── CASO 1: Es un link de Spotify ───────────────────────
    if (spotifyUrl) {
      const downloadApi = `https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(spotifyUrl)}`;
      const res = await axios.get(downloadApi).catch(() => null);

      if (res?.data?.status && res?.data?.data) {
        const data = res.data.data;
        const audioUrl = typeof data === 'string' ? data : data.url || data.download_url;
        const metadata = data.metadata || {};

        if (audioUrl) {
          let txt = `╭ ꒰ 🎧 𝓢𝓹𝓸𝓽𝓲𝓯𝔂 𝓚𝓪𝔀𝓪𝓲𝓲 🎧 ꒱\n`;
          txt += `┊ 🎵 *Canción:* ${metadata.title || 'Desconocida'}\n`;
          txt += `┊ 👤 *Artista:* ${metadata.artist || 'Desconocido'}\n`;
          txt += `┊ ✨ ¡Tu música está lista!\n`;
          txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

          return await conn.sendMessage(m.key.remoteJid, {
            audio: { url: audioUrl },
            mimetype: 'audio/mp4',
            fileName: `${metadata.title || 'audio'}.mp3`
          }, { quoted: m });
        }
      }
    }

    // ── CASO 2: Búsqueda o Fallo de API Spotify ────────────────
    // Si llegamos aquí es porque no era link o la API de Spotify falló
    const search = await yts(text);
    const video = search.videos[0];
    
    if (!video) {
        return reply(`❌ *Aww...* No encontré ninguna canción llamada _"${text}"_. 😿`);
    }

    const result = await downloadYT(video.url, 'mp4'); // Usamos mp4 para audio de alta calidad o m4a
    filePath = result.path;
    const { title, size } = result;

    let txt = `╭ ꒰ 🎧 𝓜𝓾𝓼𝓲𝓬 𝓟𝓵𝓪𝔂𝓮𝓻 🎧 ꒱\n`;
    txt += `┊ 🎵 *Canción:* ${title}\n`;
    txt += `┊ 👤 *Canal:* ${video.author.name}\n`;
    txt += `┊ 🕒 *Duración:* ${video.timestamp}\n`;
    txt += `┊ ✨ _(Fallback activo: YouTube)_ \n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    await conn.sendMessage(m.key.remoteJid, {
      audio: fs.readFileSync(filePath),
      mimetype: 'audio/mp4',
      fileName: `${title}.mp3`
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Hubo un error procesando tu música. Intenta de nuevo más tarde.');
  } finally {
    await presence('paused');
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}
