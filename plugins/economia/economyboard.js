// @nombre: economyboard
// @alias: economyboard, baltop, topdinero, ricos
// @categoria: economia
// @descripcion: Muestra los usuarios más ricos del bot (bolsillo + banco)

import { query } from '../../src/lib/database.js';
import { formatearNumero } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

export default async function (m, { isGroup, dbGroup, reply }) {
  if (isGroup && !dbGroup.economia_activa) {
    return reply('❌ *Oopsie~* La economía está desactivada aquí. 💸');
  }

  try {
    const res = await query(
      `SELECT jid, (monedas + banco) as riqueza Total 
       FROM economia 
       ORDER BY (monedas + banco) DESC LIMIT 10`
    );

    if (res.rows.length === 0) {
      return reply('⚠️ *¡Ay!* Nadie tiene dinerito en este bot todavía. 👻');
    }

    let txt = `╭ ꒰ 🏆 𝓣𝓸𝓹 𝓡𝓲𝓬𝓸𝓼 🏆 ꒱\n`;
    res.rows.forEach((row, idx) => {
      const emoji = idx === 0 ? '👑' : (idx === 1 ? '🌟' : (idx === 2 ? '✨' : '🍡'));
      txt += `┊ ${emoji} *@${row.jid.split('@')[0]}*\n`;
      txt += `┊     ↳ ${formatearNumero(row.total || 0)} ${config.economia.monedaEmoji}\n`;
    });
    txt += `╰━━━━━━━━━━━━━━━━━ 💰`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Hubo un error al buscar a los más millonarios.');
  }
}
