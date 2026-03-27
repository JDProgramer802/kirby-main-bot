// @nombre: delpack
// @alias: delpack, eliminarpack, borrarpack
// @categoria: stickers
// @descripcion: Borra un paquete de stickers por completo DE FORMA PERMANENTE. (Uso: /delpack [Nombre del Pack])

import { query } from '../../src/lib/database.js';

export default async function (m, { text, sender, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime qué paquete quieres desintegrar. `Ejemplo: /delpack Patitos` 🌸');
  }

  const nombrePack = text.trim();

  try {
    const res = await query(
      `SELECT id, nombre FROM packs_stickers WHERE jid_creador = $1 AND nombre ILIKE $2 LIMIT 1`,
      [sender, `%${nombrePack}%`]
    );

    if (res.rows.length === 0) {
      return reply(`❌ *Aww...* No encontré un paquete tuyo llamado "${nombrePack}". 😿`);
    }

    const { id, nombre } = res.rows[0];

    // Por el ON DELETE CASCADE del esquema, los stickers en la otra tabla también vuelan.
    await query(`DELETE FROM packs_stickers WHERE id = $1`, [id]);

    let txt = `╭ ꒰ 💣 𝓓𝓮𝓼𝓽𝓻𝓾𝓬𝓬𝓲𝓸𝓷 𝓚𝓪𝔀𝓪𝓲𝓲 💣 ꒱\n`;
    txt += `┊ ✨ ¡Bam!\n`;
    txt += `┊ 💔 El paquete **${nombre}** ha sido vaporizado mágicamente.\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 🌧️`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Oh no...* El paquete se aferró al servidor.');
  }
}
