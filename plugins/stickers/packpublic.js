// @nombre: packpublic
// @alias: packpublic, publicpack, publicar
// @categoria: stickers
// @descripcion: Hace que uno de tus paquetes de stickers sea público para que otros lo descarguen.

import { query } from '../../src/lib/database.js';

export default async function (m, { text, sender, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime qué paquete quieres hacer público. `Ejemplo: /packpublic Patitos` 🌸');
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

    if (res.rows[0].publico) {
      return reply('✅ *Ey...* Tu paquete ya es público. ¡El mundo entero ya lo puede ver! 🌍');
    }

    await query(`UPDATE packs_stickers SET publico = true WHERE id = $1`, [res.rows[0].id]);

    let txt = `╭ ꒰ 🌍 𝓟𝓪𝓺𝓾𝓮𝓽𝓮 𝓟𝓾𝓫𝓵𝓲𝓬𝓸 🌍 ꒱\n`;
    txt += `┊ ✨ ¡Libre para el mundo!\n`;
    txt += `┊ 💖 **${res.rows[0].nombre}** ahora es visible para todos.\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El ministerio de publicaciones detuvo el trámite.');
  }
}
