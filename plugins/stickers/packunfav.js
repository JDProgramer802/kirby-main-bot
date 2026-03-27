// @nombre: packunfav
// @alias: packunfav, unfavpack
// @categoria: stickers
// @descripcion: Quita una estrella de un paquete si ya no te gusta tanto.

import { query } from '../../src/lib/database.js';

export default async function (m, { text, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime qué paquete te decepcionó. `Ejemplo: /packunfav Kirby Cute` 🌸');
  }

  const nombre = text.trim();

  try {
    const res = await query(
      `SELECT id, nombre, publico, favoritos FROM packs_stickers WHERE nombre ILIKE $1 LIMIT 1`,
      [`%${nombre}%`]
    );

    if (res.rows.length === 0) {
      return reply(`❌ *Aww...* No existe ningún paquete llamado "${nombre}". 😿`);
    }

    if (!res.rows[0].publico) {
      return reply(`🚫 *¡Alto!* El paquete es privado y no tiene votos públicos. 🔒`);
    }

    if (res.rows[0].favoritos <= 0) {
      return reply(`⚠️ **${res.rows[0].nombre}** ya tiene 0 estrellas. No podemos darle votos negativos. 😭`);
    }

    await query(`UPDATE packs_stickers SET favoritos = favoritos - 1 WHERE id = $1`, [res.rows[0].id]);

    let txt = `╭ ꒰ 💔 𝓥𝓸𝓽𝓸 𝓡𝓮𝓽𝓲𝓻𝓪𝓭𝓸 💔 ꒱\n`;
    txt += `┊ ✨ Vaya...\n`;
    txt += `┊ 🌧️ El paquete **${res.rows[0].nombre}** perdió una estrellita (-1).\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Error al retirar la estrellita.');
  }
}
