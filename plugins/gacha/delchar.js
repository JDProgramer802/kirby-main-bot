// @nombre: delchar
// @alias: delchar, descartar
// @categoria: gacha
// @descripcion: Borra un personaje de tu harem permanentemente, sin ganar dinero.

import { query } from '../../src/lib/database.js';

export default async function (m, { text, sender, isGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  if (!text) {
    return reply('⚠️ *¡Ay!* Dime a quién quieres liberar (eliminar). `Ejemplo: /delchar Sakura` 🌸');
  }

  try {
    const res = await query(
      `SELECT h.id as harem_id, p.nombre 
       FROM harem h
       JOIN personajes_disponibles p ON h.personaje_id = p.id
       WHERE h.jid_usuario = $1 AND p.nombre ILIKE $2
       LIMIT 1`,
      [sender, `%${text.trim()}%`]
    );

    if (res.rows.length === 0) {
      return reply(`❌ *Uy...* No encontré a "${text}" en tu harem. 😿`);
    }

    const el = res.rows[0];
    await query(`DELETE FROM harem WHERE id = $1`, [el.harem_id]);

    let txt = `╭ ꒰ 🕊️ 𝓛𝓲𝓫𝓮𝓻𝓪𝓬𝓲𝓸𝓷 🕊️ ꒱\n`;
    txt += `┊ 👋 _Le dijiste adiós a_ *${el.nombre}*.\n`;
    txt += `┊ ✨ _Ahora es libre en el universo del anime._\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💔`;

    reply(txt);

  } catch (err) {
    console.error(err);
    reply('❌ *Oh no...* El hechizo de liberación falló.');
  }
}
