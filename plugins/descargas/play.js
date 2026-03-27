// @nombre: play
// @alias: play, musica, youtube
// @categoria: descargas
// @descripcion: Busca y descarga el audio de una canción en YouTube.
// @reaccion: 🎵

import fs from 'fs';
import yts from 'yt-search';
import { downloadYT } from '../../src/lib/ytdlp.js';

// ── Tipografía versalitas ─────────────────────────────────
const t = {
  title: 'ᴍᴜꜱɪᴄ ᴘʟᴀʏᴇʀ',
  search: 'ʙᴜꜱᴄᴀɴᴅᴏ',
  error: 'ᴇʀʀᴏʀ',
  notfound: 'ꜱɪɴ ʀᴇꜱᴜʟᴛᴀᴅᴏꜱ',
  artist: 'ᴀʀᴛɪꜱᴛᴀ',
  duration: 'ᴅᴜʀᴀᴄɪᴏɴ',
  size: 'ᴛᴀᴍᴀɴᴏ',
  quality: 'ᴄᴀʟɪᴅᴀᴅ',
  link: 'ʟɪɴᴋ',
  song: 'ᴄᴀɴᴄɪᴏɴ',
};

const DIV = `꒰ঌ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ໒꒱`;
const BAR = `▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░`;
const f = (label, value) => `‹ ${label} › ${value}`;

export default async function (m, { conn, text, presence }) {
  if (!text) {
    return conn.sendMessage(m.key.remoteJid, {
      text:
        `${DIV}\n` +
        `      ${t.title}\n` +
        `${DIV}\n` +
        `\n` +
        `ɪɴᴅɪᴄᴀ ᴇʟ ɴᴏᴍʙʀᴇ ᴅᴇ ᴜɴᴀ ᴄᴀɴᴄɪᴏɴ\n` +
        `_ᴇᴊᴇᴍᴘʟᴏ: /play Sabanas Blancas_`
    }, { quoted: m });
  }

  await conn.sendMessage(m.key.remoteJid, {
    text:
      `${DIV}\n` +
      `      ${t.search}\n` +
      `${DIV}\n` +
      `\n` +
      `_ꜱɪɴᴛᴏɴɪᴢᴀɴᴅᴏ ʟᴀ ʀᴀᴅɪᴏ ᴇꜱᴛᴇʟᴀʀ..._`
  }, { quoted: m });

  let filePath;

  try {
    // ── Buscar video ──────────────────────────────────────────
    let videoUrl = text;
    let videoInfo = null;

    if (!text.includes('youtu')) {
      const search = await yts(text);
      const results = search.videos;
      if (!results || results.length === 0) {
        return conn.sendMessage(m.key.remoteJid, {
          text:
            `${DIV}\n` +
            `      ${t.notfound}\n` +
            `${DIV}\n` +
            `\n` +
            `ɴᴏ ꜱᴇ ᴇɴᴄᴏɴᴛʀᴏ _"${text}"_\n` +
            `ɪɴᴛᴇɴᴛᴀ ᴄᴏɴ ᴏᴛʀᴏ ɴᴏᴍʙʀᴇ`
        }, { quoted: m });
      }
      videoInfo = results[0];
      videoUrl = videoInfo.url;
    } else {
      const videoId = text.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1];
      if (videoId) {
        const search = await yts({ videoId });
        videoInfo = search;
      }
    }

    await presence('recording');
    await new Promise(r => setTimeout(r, 1000));

    // ── Descargar como OGG Opus para nota de voz ──────────────
    const result = await downloadYT(videoUrl, 'ogg');
    filePath = result.path;
    const { title, size } = result;

    // ── Formatear datos ───────────────────────────────────────
    const rawSeconds = videoInfo?.seconds || videoInfo?.duration?.seconds || 0;
    const mins = Math.floor(rawSeconds / 60);
    const secs = String(rawSeconds % 60).padStart(2, '0');
    const durStr = rawSeconds > 0 ? `${mins}:${secs}` : 'ɴ/ᴀ';
    const sizeMB = size ? `${(size / 1024 / 1024).toFixed(2)} ᴍʙ` : 'ɴ/ᴀ';
    const channel = videoInfo?.author?.name || videoInfo?.author || 'ᴅᴇꜱᴄᴏɴᴏᴄɪᴅᴏ';
    const kbps = '64 ᴋʙᴘꜱ';

    // ── Preview ───────────────────────────────────────────────
    const preview =
      `${DIV}\n` +
      `      ${t.title}\n` +
      `${DIV}\n` +
      `\n` +
      `${f(t.song, `*${title}*`)}\n` +
      `\n` +
      `${BAR}\n` +
      `\n` +
      `${f(t.artist, channel)}\n` +
      `${f(t.duration, durStr + ' ᴍɪɴ')}\n` +
      `${f(t.size, sizeMB)}\n` +
      `${f(t.quality, kbps)}\n` +
      `${f(t.link, videoUrl)}\n` +
      `\n` +
      `${DIV}\n` +
      `_ǫᴜᴇ ᴅɪꜱꜰʀᴜᴛᴇꜱ ʟᴀ ᴍᴜꜱɪᴄᴀ_`;

    await conn.sendMessage(m.key.remoteJid, { text: preview }, { quoted: m });

    // ── Enviar como nota de voz ───────────────────────────────
    const audioBuffer = fs.readFileSync(filePath);

    await conn.sendMessage(m.key.remoteJid, {
      audio: audioBuffer,
      mimetype: 'audio/ogg; codecs=opus', // ← nota de voz
      ptt: true,                           // ← burbuja con onda
    }, { quoted: m });

    await conn.sendPresenceUpdate('paused', m.key.remoteJid);

  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.key.remoteJid, {
      text:
        `${DIV}\n` +
        `      ${t.error}\n` +
        `${DIV}\n` +
        `\n` +
        `ᴀʟɢᴏ ꜱᴀʟɪᴏ ᴍᴀʟ ᴘʀᴏᴄᴇꜱᴀɴᴅᴏ\n` +
        `ᴇʟ ᴀᴜᴅɪᴏ, ɪɴᴛᴇɴᴛᴀ ᴅᴇ ɴᴜᴇᴠᴏ`
    }, { quoted: m });
  } finally {
    // ── Limpiar temporal siempre ──────────────────────────────
    try {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (_) { }
  }
}