// @nombre: stickerdel
// @alias: stickerdel, delsticker
// @categoria: stickers
// @descripcion: Borra EL ÚLTIMO sticker añadido a tu paquete. (Uso: /stickerdel [Nombre del Pack])

import { query } from '../../src/lib/database.js';

export default async function (m, { text, sender, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime de qué paquete quitamos el último sticker.\n`Ejemplo: /stickerdel Kirby Cute` 🌸');
  }

  const nombreP = text.trim();

  try {
    // Buscar paquete suyo
    const resPack = await query(
      `SELECT id, nombre FROM packs_stickers WHERE jid_creador = $1 AND nombre ILIKE $2 LIMIT 1`,
      [sender, `%${nombreP}%`]
    );

    if (resPack.rows.length === 0) {
      return reply(`❌ *Uy...* No tienes ningún paquete llamado "${nombreP}". 😿`);
    }

    const { id, nombre } = resPack.rows[0];

    // Buscar el sticker más reciente de ese pack
    const resLast = await query(
      `SELECT id FROM stickers_items WHERE pack_id = $1 ORDER BY agregado_en DESC LIMIT 1`,
      [id]
    );

    if (resLast.rows.length === 0) {
      return reply(`⚠️ *¡Ey!* Tu paquete **${nombre}** ya está vacío. No hay nada que borrar. 📦`);
    }

    const stickerId = resLast.rows[0].id;
    await query(`DELETE FROM stickers_items WHERE id = $1`, [stickerId]);

    let txt = `╭ ꒰ ✂️ 𝓢𝓽𝓲𝓬𝓴𝓮𝓻 𝓔𝓵𝓲𝓶𝓲𝓷𝓪𝓭𝓸 ✂️ ꒱\n`;
    txt += `┊ ✨ ¡Puf!\n`;
    txt += `┊ 💔 Retiraste la última pegatina de **${nombre}**.\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Oh no...* El pegamento estaba muy fuerte y se atascó.');
  }
}
