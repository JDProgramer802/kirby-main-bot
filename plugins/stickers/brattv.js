// @nombre: brattv
// @alias: brattv, bratv
// @categoria: stickers
// @descripcion: Crea un sticker animado estilo brat que se escribe progresivamente.

import crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import Jimp from 'jimp';
import path from 'path';

const tmpDir = path.resolve('./tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

export default async function (m, { conn, text, reply }) {
  if (!text) return reply('❌ Escribe el texto que quieres animar.\n📌 Ejemplo: `/brattv escribiendo...`');
  if (text.length > 60) return reply('❌ ¡El texto es muy largo para animación! Máximo 60 caracteres por favor.');

  try {
    const fileId = crypto.randomBytes(6).toString('hex');
    const framesDir = path.join(tmpDir, `frames_${fileId}`);

    if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir);
    const outputPath = path.join(tmpDir, `brattv_${fileId}.webp`);

    reply('☁️ ✨ _Animando texto a sticker, esto puede tardar unos segundos..._');

    // Elegir fuente según el tamaño para que se vea mayor y gruesa
    let fontToUse;
    if (text.length <= 20) fontToUse = Jimp.FONT_SANS_128_BLACK;
    else if (text.length <= 40) fontToUse = Jimp.FONT_SANS_64_BLACK;
    else fontToUse = Jimp.FONT_SANS_32_BLACK;

    const font = await Jimp.loadFont(fontToUse);

    const printSuperBold = async (image, text) => {
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

    // Generar un frame por cada letra
    const framesCount = text.length;
    let currentText = "";

    for (let i = 0; i < framesCount; i++) {
        currentText += text[i];
        const image = new Jimp(512, 512, 0xFFFFFFFF); // Fondo blanco
        await printSuperBold(image, currentText);
        const seq = String(i + 1).padStart(3, '0');
        await image.writeAsync(path.join(framesDir, `frame_${seq}.png`));
    }

    // Último frame copiado varias veces para dar tiempo a leer el texto final
    const extraFrames = 15; // Un poco más de 1 segundo detenido
    for (let j = 0; j < extraFrames; j++) {
        const seq = String(framesCount + 1 + j).padStart(3, '0');
        fs.copyFileSync(
            path.join(framesDir, `frame_${String(framesCount).padStart(3, '0')}.png`),
            path.join(framesDir, `frame_${seq}.png`)
        );
    }

    // ffmpeg para juntarlos a ~12 fps (letras por segundo)
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(path.join(framesDir, 'frame_%03d.png'))
        .inputFPS(12)
        .on('error', reject)
        .on('end', resolve)
        .addOutputOptions([
          `-vcodec`, `libwebp`,
          `-loop`, `0`,  // Animar infinitamente
          `-vsync`, `0`,
          `-vf`, `scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0`
        ])
        .toFormat('webp')
        .save(outputPath);
    });

    const stickerBuffer = fs.readFileSync(outputPath);

    let finalBuffer = stickerBuffer;
    try {
      // Añadir metadatos (Packname y Author)
      const exif = createStickerExif();
      finalBuffer = await sharp(stickerBuffer, { animated: true })
        .webp()
        .withMetadata({ exif })
        .toBuffer();
    } catch (e) {
      console.error('Error al añadir metadatos al sticker:', e.message);
      finalBuffer = await sharp(stickerBuffer, { animated: true }).webp().toBuffer();
    }

    // Enviar Sticker WebP animado
    await conn.sendMessage(m.key.remoteJid, { sticker: finalBuffer }, { quoted: m });

    // Limpiar toda la basura (carpeta de frames y webp saliente)
    fs.rmSync(framesDir, { recursive: true, force: true });
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

  } catch (err) {
    console.error('Error en comando brattv:', err);
    reply('❌ Hubo un error fatal al intentar animar el sticker. Asegúrate de que FFmpeg y Jimp están sanos.');
  }
}
