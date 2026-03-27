// @nombre: topcount
// @alias: topcount, topmensajes, activos
// @categoria: admin
// @descripcion: Muestra los usuarios con más mensajes en el grupo (o de menciones)

import { query } from '../../src/lib/database.js';
import { extraerMenciones } from '../../src/lib/utils.js';

export default async function (m, { isGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  try {
    const menciones = extraerMenciones(m);

    if (menciones && menciones.length > 0) {
      const resultados = [];
      for (const jid of menciones) {
        const r = await query(
          `SELECT cantidad FROM mensajes_grupo WHERE jid_grupo = $1 AND jid_usuario = $2`,
          [m.key.remoteJid, jid]
        );
        resultados.push({
          jid,
          cantidad: r.rows[0] ? r.rows[0].cantidad : 0
        });
      }

      resultados.sort((a, b) => b.cantidad - a.cantidad);

      let txt = `╭ ꒰ 🏆 𝓣𝓸𝓹 𝓐𝓬𝓽𝓲𝓿𝓸𝓼 (Menciones) 🏆 ꒱\n`;
      resultados.forEach((row, idx) => {
        const emoji = idx === 0 ? '👑' : (idx === 1 ? '🌟' : (idx === 2 ? '✨' : '🍡'));
        txt += `┊ ${emoji} *@${row.jid.split('@')[0]}*\n`;
        txt += `┊     ↳ ${row.cantidad} mensajes\n`;
      });
      txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

      return reply(txt, { mentions: resultados.map(r => r.jid) });
    }

    const res = await query(
      `SELECT jid_usuario, cantidad FROM mensajes_grupo
       WHERE jid_grupo = $1 ORDER BY cantidad DESC LIMIT 10`,
      [m.key.remoteJid]
    );

    if (res.rows.length === 0) {
      return reply('⚠️ *¡Ay!* Nadie ha hablado en este grupo todavía. 👻');
    }

    let txt = `╭ ꒰ 🏆 𝓣𝓸𝓹 𝓐𝓬𝓽𝓲𝓿𝓸𝓼 🏆 ꒱\n`;
    const mentions = [];
    res.rows.forEach((row, idx) => {
      const emoji = idx === 0 ? '👑' : (idx === 1 ? '🌟' : (idx === 2 ? '✨' : '🍡'));
      txt += `┊ ${emoji} *@${row.jid_usuario.split('@')[0]}*\n`;
      txt += `┊     ↳ ${row.cantidad} mensajes\n`;
      mentions.push(row.jid_usuario);
    });
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt, { mentions });
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Hubo un error al cargar el top.');
  }
}
