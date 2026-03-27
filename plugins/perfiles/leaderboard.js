// @nombre: leaderboard
// @alias: leaderboard, topnivel, topxp
// @categoria: perfiles
// @descripcion: Muestra los usuarios con más nivel y experiencia de la base de datos global.

import { query } from '../../src/lib/database.js';

export default async function (m, { reply }) {
  try {
    const res = await query(
      `SELECT jid, nombre, nivel, xp FROM usuarios ORDER BY nivel DESC, xp DESC LIMIT 10`
    );

    if (res.rows.length === 0) {
      return reply('⚠️ *Oye...* Nadie tiene experiencia aquí. ¡Empiecen a chatear! 💬');
    }

    let txt = `╭ ꒰ 🏆 𝓣𝓸𝓹 𝓝𝓲𝓿𝓮𝓵𝓮𝓼 🏆 ꒱\n`;
    
    res.rows.forEach((u, i) => {
      let emoji = i === 0 ? '👑' : (i === 1 ? '🌟' : (i === 2 ? '✨' : '🌸'));
      let nom = u.nombre || `@${u.jid.split('@')[0]}`;
      txt += `┊ ${emoji} ${nom}\n`;
      txt += `┊    ↳ Nivel: ${u.nivel} | XP: ${u.xp}\n`;
    });
    
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Se nos perdieron las medallas.');
  }
}
