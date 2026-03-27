// @nombre: brat
// @alias: brat
// @categoria: stickers
// @descripcion: Crea un sticker estático estilo brat con tu texto.

import crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import Jimp from 'jimp';
import path from 'path';
import sharp from 'sharp';
import { addExifToWebP, createStickerExif } from '../../src/lib/utils.js';

const tmpDir = path.resolve('./tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

export default async function (m, { conn, text, reply }) {
  if (!text) return reply('❌ Escribe el texto que quieres convertir en sticker.\n📌 Ejemplo: `/brat hola mundo`');

  try {
    const fileId = crypto.randomBytes(6).toString('hex');
    const inputPath = path.join(tmpDir, `brat_${fileId}.png`);
    const outputPath = path.join(tmpDir, `brat_${fileId}.webp`);

    reply('☁️ ✨ _Generando sticker brat..._');

    // 1. Crear fondo blanco 512x512
    const image = new Jimp(512, 512, 0xFFFFFFFF);

    // 2. Elegir tamaño de fuente de Jimp para más impacto y legibilidad
    let fontToUse;
    if (text.length <= 20) fontToUse = Jimp.FONT_SANS_128_BLACK;
    else if (text.length <= 45) fontToUse = Jimp.FONT_SANS_64_BLACK;
    else fontToUse = Jimp.FONT_SANS_32_BLACK;

    const font = await Jimp.loadFont(fontToUse);

    // Función helper para simular texto grueso (outline) superponiendo múltiples impresiones
    const printSuperBold = (image, text) => {
      const offsets = [
        { x: -1, y: 0 }, { x: 1, y: 0 },
        { x: 0, y: -1 }, { x: 0, y: 1 },
        { x: -1, y: -1 }, { x: 1, y: -1 },
        { x: -1, y: 1 }, { x: 1, y: 1 }
      ];

      for (const o of offsets) {
        image.print(
          font,
          20 + o.x,
          20 + o.y,
          {
            text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
          },
          472,
          472
        );
      }

      image.print(
        font,
        20,
        20,
        {
          text,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        },
        472,
        472
      );
    };

    // 3. Imprimir texto centrado y grueso
    printSuperBold(image, text);

    await image.writeAsync(inputPath);

    // 4. Convertir a WebP con FFmpeg para garantizar formato sticker de WhatsApp
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .on('error', reject)
        .on('end', resolve)
        .addOutputOptions([
          `-vcodec`, `libwebp`,
          // Escala el pad igual por si acaso FFmpeg lo requiere
          `-vf`, `scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0`
        ])
        .toFormat('webp')
        .save(outputPath);
    });

    const stickerBuffer = fs.readFileSync(outputPath);

    const senderJid = m.key.participant || m.key.remoteJid;
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

    const packName = 'Brat Stickers';
    const authorName = displayName;

    try {
      const exifData = createStickerExif(packName, authorName);
      const finalBuffer = addExifToWebP(stickerBuffer, exifData);
      await conn.sendMessage(m.key.remoteJid, { sticker: finalBuffer }, { quoted: m });
    } catch (e) {
      console.error('Error al añadir metadatos al sticker:', e.message);
      const finalBuffer = await sharp(stickerBuffer).webp().toBuffer();
      await conn.sendMessage(m.key.remoteJid, { sticker: finalBuffer }, { quoted: m });
    }

    // 6. Limpieza de basura temporal
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

  } catch (err) {
    console.error('Error en comando brat:', err);
    reply('❌ *Oops...* Hubo un error al generar el sticker. Intenta nuevamente o revisa los logs.');
  }
}
