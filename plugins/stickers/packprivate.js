// @nombre: packprivate
// @alias: packprivate, privatepack, ocultar
// @categoria: stickers
// @descripcion: Oculta uno de tus paquetes de stickers para que solo tú puedas verlo/descargarlo.

import { query } from '../../src/lib/database.js';

export default async function (m, { text, sender, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime qué paquete quieres volver privado. `Ejemplo: /packprivate Patitos` 🌸');
  }

  const nombre = text.trim();

  try {
    const res = await query(
      `SELECT id, nombre, publico FROM packs_stickers WHERE jid_creador = $1 AND nombre ILIKE $2 LIMIT 1`,
      [sender, `%${nombre}%`]
    );

    if (res.rows.length === 0) {
      return reply(`❌ *Aww...* No encontré un paquete tuyo llamado "${nombre}". 😿`);
    }

    if (!res.rows[0].publico) {
      return reply('✅ *Ey...* Tu paquete ya es privado. Tus secretos están a salvo. 🔒');
    }

    await query(`UPDATE packs_stickers SET publico = false WHERE id = $1`, [res.rows[0].id]);

    let txt = `╭ ꒰ 🔒 𝓟𝓪𝓺𝓾𝓮𝓽𝓮 𝓟𝓻𝓲𝓿𝓪𝓭𝓸 🔒 ꒱\n`;
    txt += `┊ ✨ ¡Shhh...!\n`;
    txt += `┊ 💖 **${res.rows[0].nombre}** ha sido ocultado de las miradas curiosas.\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El cerrajero perdió la llave. Intenta luego.');
  }
}
