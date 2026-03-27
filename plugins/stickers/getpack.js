// @nombre: getpack
// @alias: getpack, descargarpack, robarpack
// @categoria: stickers
// @descripcion: Descarga todos los stickers de un paquete tuyo o público. (Uso: /getpack [Nombe] o /getpack @user [Nombre])

import { query } from '../../src/lib/database.js';
import { extraerMenciones } from '../../src/lib/utils.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';

const tmpDir = path.resolve('./tmp');

export default async function (m, { conn, text, sender, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime qué paquete extraigo de la estantería.\n`Ejemplo: /getpack Kirby Cute` 🌸');
  }

  const objetivo = extraerMenciones(m)[0] || sender;
  const nombre = text.replace(/@\d+/g, '').trim();

  try {
    // Buscar el pack
    const resPack = await query(
      `SELECT id, nombre, publico, jid_creador 
       FROM packs_stickers 
       WHERE jid_creador = $1 AND nombre ILIKE $2 LIMIT 1`,
      [objetivo, `%${nombre}%`]
    );

    if (resPack.rows.length === 0) {
      return reply(`❌ *Aww...* No encontré el paquete "${nombre}". 😿`);
    }

    const pack = resPack.rows[0];

    // Chequear visibilidad
    if (pack.jid_creador !== sender && !pack.publico) {
      return reply(`🚫 *¡Shhh!* El paquete de @${pack.jid_creador.split('@')[0]} es súper secreto y privado. 🔒`);
    }

    // Obtener stickers
    const resItems = await query(`SELECT url_imagen FROM stickers_items WHERE pack_id = $1 ORDER BY agregado_en ASC`, [pack.id]);

    if (resItems.rows.length === 0) {
      return reply('⚠️ *Uh oh...* Ese paquete está vacío, no hay nada que descargar. 📦');
    }

    reply(`☁️ ✨ _Descargando ${resItems.rows.length} figuritas de **${pack.nombre}**..._`);

    // Enviar cada sticker
    // Nota: Como la base tiene URL de imgBB (JPG/PNG usualmente), los pasamos a WebP on the fly o enviamos como imagen con AsSticker
    // Baileys tiene problema enviando URLs directas como sticker a veces, así que lo haré procesando a buffer y luego ffmpeg.
    
    for (let item of resItems.rows) {
      try {
        const resp = await axios.get(item.url_imagen, { responseType: 'arraybuffer' });
        const inputBuffer = Buffer.from(resp.data);

        const fileId = crypto.randomBytes(6).toString('hex');
        const inputPath = path.join(tmpDir, `dl_${fileId}.png`);
        const outputPath = path.join(tmpDir, `st_${fileId}.webp`);
        fs.writeFileSync(inputPath, inputBuffer);

        await new Promise((resolve, reject) => {
          ffmpeg(inputPath)
            .on('error', reject)
            .on('end', resolve)
            .addOutputOptions([
              `-vcodec`, `libwebp`,
              `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`
            ])
            .toFormat('webp')
            .save(outputPath);
        });

        const stickerBuffer = fs.readFileSync(outputPath);

        await conn.sendMessage(m.key.remoteJid, {
          sticker: stickerBuffer,
        });

        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      } catch (errLoop) {
        console.error('Error procesando sticker individual', errLoop);
        // Continuar con los demás
      }
    }

    reply(`✅ *¡Ta-da!* Se entregó el paquete completito. 💌`);
  } catch (err) {
    console.error(err);
    reply('❌ *Oh no...* El camión de reparto chocó.');
  }
}
