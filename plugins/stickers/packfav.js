// @nombre: packfav
// @alias: packfav, favpack
// @categoria: stickers
// @descripcion: Añade estrellas a un paquete público para que suba en popularidad.

import { query } from '../../src/lib/database.js';

export default async function (m, { text, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime qué paquete te encantó para darle me gusta. `Ejemplo: /packfav Kirby Cute` 🌸');
  }

  const nombre = text.trim();

  try {
    const res = await query(
      `SELECT id, nombre, publico FROM packs_stickers WHERE nombre ILIKE $1 LIMIT 1`,
      [`%${nombre}%`]
    );

    if (res.rows.length === 0) {
      return reply(`❌ *Aww...* No existe ningún paquete llamado "${nombre}". 😿`);
    }

    if (!res.rows[0].publico) {
      return reply(`🚫 *¡Alto!* El paquete **${res.rows[0].nombre}** es privado. No se puede votar por él. 🔒`);
    }

    await query(`UPDATE packs_stickers SET favoritos = favoritos + 1 WHERE id = $1`, [res.rows[0].id]);

    let txt = `╭ ꒰ ⭐ 𝓥𝓸𝓽𝓸 𝓔𝓼𝓽𝓻𝓮𝓵𝓪𝓻 ⭐ ꒱\n`;
    txt += `┊ ✨ ¡Gracias por tu apoyo!\n`;
    txt += `┊ 💖 El paquete **${res.rows[0].nombre}** recibió +1 estrella.\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* La estrellita se cayó del cielo de camino al paquete.');
  }
}
