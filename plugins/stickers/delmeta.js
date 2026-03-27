// @nombre: delmeta
// @alias: delmeta, deldesc
// @categoria: stickers
// @descripcion: Borra la descripción de tu paquete de stickers. (Uso: /delmeta [Nombre])

import { query } from '../../src/lib/database.js';

export default async function (m, { text, sender, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime a qué paquete le borramos la descripción. `Ejemplo: /delmeta Patitos` 🌸');
  }

  const nombre = text.trim();

  try {
    const res = await query(
      `SELECT id, nombre FROM packs_stickers WHERE jid_creador = $1 AND nombre ILIKE $2 LIMIT 1`,
      [sender, `%${nombre}%`]
    );

    if (res.rows.length === 0) {
      return reply(`❌ *Aww...* No encontré un paquete tuyo llamado "${nombre}". 😿`);
    }

    await query(`UPDATE packs_stickers SET descripcion = '' WHERE id = $1`, [res.rows[0].id]);

    let txt = `╭ ꒰ 🗑️ 𝓓𝓮𝓼𝓬𝓻𝓲𝓹𝓬𝓲𝓸𝓷 𝓑𝓸𝓻𝓻𝓪𝓭𝓪 🗑️ ꒱\n`;
    txt += `┊ ✨ ¡Listo!\n`;
    txt += `┊ 💖 El paquete **${res.rows[0].nombre}** ahora es un misterio...\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El borrador se rompió.');
  }
}
