// @nombre: toimage
// @alias: toimg
// @categoria: utilidad
// @descripcion: Convertir un sticker/imagen a imagen visible (JPG/PNG).
// @reaccion: 🖼️

import { downloadMediaMessage } from '@itsukichann/baileys';
import crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

const tmpDir = path.resolve('./tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

export default async function(m, { conn, reply }) {
  let targetMessage = m;
  const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (quoted) targetMessage = { message: quoted };

  const type = Object.keys(targetMessage.message || {})[0];
  const isSticker = type === 'stickerMessage';
  const isImage = type === 'imageMessage';

  if (!isSticker && !isImage) {
    return reply('❗ Por favor, responde a un sticker o imagen con #toimage para convertirlo.');
  }

  try {
    const mediaBuffer = await downloadMediaMessage(targetMessage, 'buffer', {});

    if (isImage) {
      await conn.sendMessage(m.key.remoteJid, {
        image: mediaBuffer,
        caption: '🖼️ Aquí tienes la imagen convertida.'
      }, { quoted: m });
      return;
    }

    // Convertir sticker WebP a PNG
    const fileId = crypto.randomBytes(6).toString('hex');
    const inputPath = path.join(tmpDir, `toimage_${fileId}.webp`);
    const outputPath = path.join(tmpDir, `toimage_${fileId}.png`);
    fs.writeFileSync(inputPath, mediaBuffer);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions(['-vcodec', 'png'])
        .on('error', reject)
        .on('end', resolve)
        .save(outputPath);
    });

    const outputBuffer = fs.readFileSync(outputPath);
    await conn.sendMessage(m.key.remoteJid, {
      image: outputBuffer,
      caption: '🖼️ Sticker convertido a imagen exitosamente.'
    }, { quoted: m });

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
  } catch (err) {
    console.error('toimage error', err);
    reply('❌ No se pudo convertir la imagen. Asegúrate de citar correctamente el sticker o imagen.');
  }
}

