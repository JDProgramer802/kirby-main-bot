// @nombre: setmeta
// @alias: setmeta, packdesc
// @categoria: stickers
// @descripcion: Añade o cambia la descripción de tu paquete de stickers. (Uso: /setmeta [Nombre del Pack] | [Descripción])

import { query } from '../../src/lib/database.js';

export default async function (m, { text, sender, reply }) {
  if (!text || !text.includes('|')) {
    return reply('⚠️ *¡Ay!* Debes usar el formato correcto.\n`Ejemplo: /setmeta Patitos | Los mejores patos del mundo` 🌸');
  }

  const partes = text.split('|');
  const nombre = partes[0].trim();
  const desc = partes.slice(1).join('|').trim();

  try {
    const res = await query(
      `SELECT id, nombre FROM packs_stickers WHERE jid_creador = $1 AND nombre ILIKE $2 LIMIT 1`,
      [sender, `%${nombre}%`]
    );

    if (res.rows.length === 0) {
      return reply(`❌ *Aww...* No encontré un paquete tuyo llamado "${nombre}". 😿`);
    }

    await query(`UPDATE packs_stickers SET descripcion = $1 WHERE id = $2`, [desc, res.rows[0].id]);

    let txt = `╭ ꒰ 📝 𝓓𝓮𝓼𝓬𝓻𝓲𝓹𝓬𝓲𝓸𝓷 📝 ꒱\n`;
    txt += `┊ ✨ ¡Metadatos guardados!\n`;
    txt += `┊ 💖 **${res.rows[0].nombre}** ahora dice: _"${desc}"_\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El lápiz mágico se quedó sin tinta.');
  }
}
