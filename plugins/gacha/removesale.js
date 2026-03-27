// @nombre: removesale
// @alias: removesale, quitarventa
// @categoria: gacha
// @descripcion: Quita un personaje tuyo del mercado global. (Uso: /removesale [nombre])

import { query } from '../../src/lib/database.js';

export default async function (m, { text, sender, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime a quién quieres quitar del mercado. `Ejemplo: /removesale Asuna` 🌸');
  }

  try {
    const res = await query(
      `SELECT h.id, p.nombre 
       FROM harem h JOIN personajes_disponibles p ON h.personaje_id = p.id
       WHERE h.jid_usuario = $1 AND p.nombre ILIKE $2 AND h.en_venta = true LIMIT 1`,
      [sender, `%${text.trim()}%`]
    );

    if (res.rows.length === 0) {
      return reply(`❌ *Aww...* No encontré a "${text}" a la venta en tu harem. 😿`);
    }

    await query(`UPDATE harem SET en_venta = false, precio_venta = 0 WHERE id = $1`, [res.rows[0].id]);

    let txt = `╭ ꒰ 🛍️ 𝓡𝓮𝓽𝓲𝓻𝓸 𝓭𝓮 𝓜𝓮𝓻𝓬𝓪𝓭𝓸 🛍️ ꒱\n`;
    txt += `┊ ✨ \n`;
    txt += `┊ 💖 ¡Retiraste a **${res.rows[0].nombre}** del mercado!\n`;
    txt += `┊ 🏠 _¡Se queda contigo!_\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;
    
    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El registro mercantil se atoró.');
  }
}
