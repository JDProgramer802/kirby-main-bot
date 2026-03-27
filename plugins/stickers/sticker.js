// @nombre: sticker
// @alias: sticker, s, stiker, pegatina
// @categoria: stickers
// @descripcion: Convierte una imagen, GIF corto o video (máx 10s) en un sticker.

import { downloadMediaMessage } from '@itsukichann/baileys';
import crypto from 'crypto';
import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import config from '../../src/lib/config.js';

const tmpDir = path.resolve('./tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

ffmpeg.setFfmpegPath(ffmpegStatic);

export default async function (m, { conn, reply }) {
  const text = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
  const isImageMode = text.toLowerCase().includes('img') || text.toLowerCase().includes('image') || text.toLowerCase().includes('grande') || text.toLowerCase().includes('large');

  const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  let targetMessage = quoted ? { message: quoted } : m;

  // Soporte directo: si el comando se envía con sticker/image/video sin quote
  if (!quoted) {
    if (m.message?.stickerMessage) targetMessage = { message: { stickerMessage: m.message.stickerMessage } };
    else if (m.message?.imageMessage) targetMessage = { message: { imageMessage: m.message.imageMessage } };
    else if (m.message?.videoMessage) targetMessage = { message: { videoMessage: m.message.videoMessage } };
  }

  const remoteJid = m.key.remoteJid;
  const senderJid = m.key.participant || m.key.remoteJid;

  const type = Object.keys(targetMessage.message || {})[0];
  const isViewOnce = type === 'viewOnceMessageV2' || type === 'viewOnceMessage';

  let mediaMessage = isViewOnce
    ? targetMessage.message[type].message
    : targetMessage.message;

  const mediaType = Object.keys(mediaMessage || {})[0];

  const isImage   = mediaType === 'imageMessage';
  const isVideo   = mediaType === 'videoMessage';
  const isSticker = mediaType === 'stickerMessage';

  const content =
    isImage   ? mediaMessage.imageMessage   :
    isVideo   ? mediaMessage.videoMessage   :
    isSticker ? mediaMessage.stickerMessage :
    null;

  if (!isImage && !isVideo && !isSticker) {
    return reply('📸 *¡Uff!* Responde o envía una imagen, video (max 10s) o sticker con `/s` para hacer la magia. 🌸');
  }

  if (isVideo && mediaMessage.videoMessage?.seconds > 10) {
    return reply('❌ *Uh oh...* El video es muy largo. Máximo 10 segunditos. ⏳');
  }

  if (!content) {
    return reply('❌ *Oh no...* No pude leer los datos del archivo.\nResponde o envía la imagen / video / sticker original.');
  }

  // Construir nombre de pack y autor según contexto (grupo / usuario)
  let packName = config.botNombre;
  let authorName = config.botDev;

  try {
    const numero = senderJid ? senderJid.split('@')[0].split(':')[0] : '';
    let displayName = m.pushName || '';

    if (!displayName && senderJid) {
      try {
        displayName = await conn.getName(senderJid);
      } catch {
        displayName = '';
      }
    }

    if (!displayName) displayName = numero || 'Usuario';

    if (remoteJid && remoteJid.endsWith('@g.us')) {
      const meta = await conn.groupMetadata(remoteJid);
      const groupName = meta?.subject || remoteJid.split('@')[0];
      packName = `${groupName} · Stickers`;
      authorName = `${displayName} · ${groupName}`;
    } else {
      packName = 'Kirby DM Stickers';
      authorName = displayName;
    }
  } catch {
    packName = config.botNombre;
    authorName = config.botDev;
  }

  let fileId; // declarar fuera del try para usarlo en el catch

  try {
    // Construir el objeto que Baileys espera para descargar
    const msgToDownload = isViewOnce
      ? { message: mediaMessage }
      : { message: { [mediaType]: content } };

    const buffer = await downloadMediaMessage(msgToDownload, 'buffer', {});

    if (!buffer || buffer.length === 0) {
      throw new Error('Buffer vacío: no se pudo descargar el medio');
    }

    fileId = crypto.randomBytes(6).toString('hex');
    const inputExt  = isImage ? '.jpg' : isVideo ? '.mp4' : '.webp';
    const outputExt = isImage ? '.webp' : isVideo ? '.gif' : '.webp';
    const inputPath = path.join(tmpDir, `in_${fileId}${inputExt}`);
    const outputPath = path.join(tmpDir, `out_${fileId}${outputExt}`);
    const finalPath = path.join(tmpDir, `final_${fileId}.webp`);

    fs.writeFileSync(inputPath, buffer);

    // Función helper que aplica EXIF con pack/grupo y autor/usuario
    const applyExif = (buf) => {
      // Temporalmente deshabilitado para probar
      return buf;
      // const exifData = createStickerExif(packName, authorName);
      // return addExifToWebP(buf, exifData);
    };

    if (isSticker) {
      const baseSticker = await sharp(buffer)
        .webp()
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer();

      const finalSticker = isImageMode ? baseSticker : applyExif(baseSticker);
      const messageType = isImageMode ? { image: finalSticker } : { sticker: finalSticker };
      await conn.sendMessage(m.key.remoteJid, messageType, { quoted: m });
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      return;
    }

    reply('☁️ ✨ _Creando pegatina mágica..._');

    if (isImage) {
      await sharp(inputPath)
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp({ quality: 80 })
        .toFile(outputPath);
    } else {
      // Convertir video a GIF primero
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .on('error', reject)
          .on('end', resolve)
          .addOutputOptions([
            '-vf', 'fps=10,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black',
            '-t', '10'
          ])
          .toFormat('gif')
          .save(outputPath);
      });

      // Luego convertir GIF a WebP animado con Sharp
      await sharp(outputPath, { animated: true })
        .resize(512, 512)
        .webp({ quality: 80, loop: 0 })
        .toFile(finalPath);
    }

    const stickerBuffer = isVideo ? fs.readFileSync(finalPath) : fs.readFileSync(outputPath);
    const finalBuffer   = isImageMode ? stickerBuffer : applyExif(stickerBuffer);
    const messageType = isImageMode ? { image: finalBuffer } : { sticker: finalBuffer };

    await conn.sendMessage(m.key.remoteJid, messageType, { quoted: m });

    if (fs.existsSync(inputPath))  fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    if (isVideo && fs.existsSync(finalPath)) fs.unlinkSync(finalPath);

  } catch (err) {
    console.error('Error en el comando sticker:', err);
    reply('❌ *Oh no...* El taller de stickers falló. Comprueba que el archivo no esté corrupto o sea demasiado pesado.');

    if (fileId) {
      try {
        const files = fs.readdirSync(tmpDir).filter(f => f.includes(fileId));
        for (const f of files) fs.unlinkSync(path.join(tmpDir, f));
      } catch (_) {}
    }
  }
}
