// @nombre: stickeradd
// @alias: stickeradd, addr, srtadd
// @categoria: stickers
// @descripcion: Añade la imagen o sticker que estás respondiendo a un paquete tuyo. (Uso: /stickeradd [Nombre del Pack])

import { downloadMediaMessage } from '@itsukichann/baileys';
import { subirAImgBB } from '../../src/lib/imgbb.js';
import { query } from '../../src/lib/database.js';
import fs from 'fs';
import path from 'path';

// Asegurar temp
const tmpDir = path.resolve('./tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

export default async function (m, { text, sender, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime a qué paquete le quieres añadir esta cosita.\n`Ejemplo: /stickeradd Kirby Cute` 🌸');
  }

  let isQuoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!isQuoted) {
    return reply('📸 *Aww...* Tienes que responder a una IMAGEN o STICKER con el comando para poder añadirlo.');
  }

  // Descargar
  const targetMessage = { message: isQuoted };
  const type = Object.keys(isQuoted || {})[0];
  const isImage = type === 'imageMessage';
  const isSticker = type === 'stickerMessage';

  if (!isImage && !isSticker) {
    return reply('❌ *Uh oh...* Solo puedes añadir imágenes o stickers estáticos a tus paquetes. Nada de audios. 🥺');
  }

  try {
    // Buscar si el pack existe y es dueño
    const resPacks = await query(`SELECT id, nombre FROM packs_stickers WHERE jid_creador = $1 AND nombre ILIKE $2 LIMIT 1`, [sender, `%${text.trim()}%`]);
    
    if (resPacks.rows.length === 0) {
      return reply(`❌ *Uy...* No tienes ningún paquete llamado "${text}". 😿`);
    }

    const packId = resPacks.rows[0].id;
    const packNombre = resPacks.rows[0].nombre;

    reply('☁️ ✨ _Procesando imagen mágica..._ (Esto tomará unos segunditos)');

    const buffer = await downloadMediaMessage(targetMessage, 'buffer', {});

    // Guardar imagen/sticker en ImgBB
    // Si es sticker(webp), ImgBB podría rechazar subidas raw de webp dependiendo, pero la API general lo transcodea a PNG o lo acepta.
    // Para no romper la subida de webp a ImgBB si falla, ImgBB suele aceptar imágenes png/jpg/gif. 
    // Si ImgBB soporta webp, subirAImgBB pasará, de lo contrario habría que re-convertirlo.
    const urlImg = await subirAImgBB(buffer);

    if (!urlImg) {
      return reply('❌ *¡Oh no!* ImgBB rechazó tu figurita. Intenta que no sea un sticker animado y sea muy ligero. 🌧️');
    }

    // Verificar que el paquete no esté muy lleno (ej. máximo 30 stickers por ahora)
    const resCount = await query(`SELECT COUNT(id) as total FROM stickers_items WHERE pack_id = $1`, [packId]);
    if (parseInt(resCount.rows[0].total) >= 30) {
      return reply('❌ *¡Alto ahí!* Tu paquete ya tiene 30 figuritas. Ya explotará si metes más. 💥');
    }

    await query(`INSERT INTO stickers_items (pack_id, url_imagen) VALUES ($1, $2)`, [packId, urlImg]);

    let txt = `╭ ꒰ 📦 𝓟𝓪𝓺𝓾𝓮𝓽𝓮 𝓐𝓬𝓽𝓾𝓪𝓵𝓲𝓩𝓪𝓭𝓸 📦 ꒱\n`;
    txt += `┊ ✨ ¡Ta-da!\n`;
    txt += `┊ 💖 Se añadió a **${packNombre}**.\n`;
    txt += `┊ 🌺 _Tu paquete se hace más gordito._\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El pegamento se secó y no pude agregar el sticker a la caja.');
  }
}
