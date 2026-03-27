// @nombre: wtop
// @alias: wtop, harems, topharem
// @categoria: gacha
// @descripcion: Muestra los usuarios con el Harem más extenso del bot

import { query } from '../../src/lib/database.js';

export default async function (m, { isGroup, dbGroup, reply }) {
  if (isGroup && !dbGroup.gacha_activo) {
    return reply('❌ *Oopsie~* El gacha está desactivado aquí. 💸');
  }

  try {
    const res = await query(
      `SELECT jid_usuario, COUNT(id) as total_personajes 
       FROM harem 
       GROUP BY jid_usuario 
       ORDER BY COUNT(id) DESC 
       LIMIT 10`
    );

    if (res.rows.length === 0) {
      return reply('⚠️ *¡Ay!* Nadie tiene un harem en este universo todavía. 👻');
    }

    let txt = `╭ ꒰ 🏆 𝓣𝓸𝓹 𝓗𝓪𝓻𝓮𝓶𝓼 🏆 ꒱\n`;
    res.rows.forEach((row, idx) => {
      const emoji = idx === 0 ? '👑' : (idx === 1 ? '🌟' : (idx === 2 ? '✨' : '🌸'));
      txt += `┊ ${emoji} *@${row.jid_usuario.split('@')[0]}*\n`;
      txt += `┊     ↳ ${row.total_personajes} personajes\n`;
    });
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Hubo un error al buscar a los más conquistadores.');
  }
}
