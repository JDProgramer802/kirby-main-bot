// @nombre: stickerinfo
// @alias: sinfo, sinfo, stinfo
// @categoria: stickers
// @descripcion: Muestra información de un sticker citado (pack y autor si está disponible).
// @reaccion: 📝

import { downloadMediaMessage } from '@itsukichann/baileys';

function parseWebPExif(buffer) {
  if (buffer.slice(0, 4).toString('ascii') !== 'RIFF' || buffer.slice(8, 12).toString('ascii') !== 'WEBP') {
    throw new Error('El archivo no parece un WebP válido.');
  }

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const fourCC = buffer.slice(offset, offset + 4).toString('ascii');
    const size = buffer.readUInt32LE(offset + 4);

    if (fourCC === 'EXIF') {
      const exifBuffer = buffer.slice(offset + 8, offset + 8 + size);
      const text = exifBuffer.toString('utf-8').trim();
      try {
        return JSON.parse(text);
      } catch {
        return { raw: text };
      }
    }

    offset += 8 + size + (size % 2);
  }

  return null;
}

export default async function (m, { conn, reply }) {
  const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const messageSource = quoted ? { message: quoted } : m;
  const type = Object.keys(messageSource.message || {})[0];

  if (type !== 'stickerMessage') {
    return reply('⚠️ Usa este comando respondiendo a un sticker (o envía el sticker y luego ejecútalo).');
  }

  try {
    const buffer = await downloadMediaMessage(messageSource, 'buffer', {});
    const exif = parseWebPExif(buffer);

    const defaultPack = config.botNombre || 'Kirby Dream';
    const defaultAuthor = config.botDev || 'Dream Team';

    if (!exif || (!exif['sticker-pack-name'] && !exif['sticker-pack-publisher'] && !exif.raw)) {
      return reply(`ℹ️ No se encontró metadata EXIF.\n- Pack (por defecto): ${defaultPack}\n- Autor (por defecto): ${defaultAuthor}`);
    }

    if (exif.raw && !exif['sticker-pack-name'] && !exif['sticker-pack-publisher']) {
      return reply(`📦 EXIF personalizado: ${exif.raw}\n- Pack (por defecto): ${defaultPack}\n- Autor (por defecto): ${defaultAuthor}`);
    }

    const packname = exif['sticker-pack-name'] || defaultPack;
    const publisher = exif['sticker-pack-publisher'] || defaultAuthor;

    return reply(`📌 Información del Sticker:\n- Pack: ${packname}\n- Autor: ${publisher}`);
  } catch (err) {
    console.error('stickerinfo error', err);
    return reply('❌ No se pudo leer la información del sticker. Asegúrate de que el sticker es accesible y es un WebP válido.');
  }
};
