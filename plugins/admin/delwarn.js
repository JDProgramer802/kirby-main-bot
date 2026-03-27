// @nombre: delwarn
// @alias: delwarn, unwarn, quitaradvertencia
// @categoria: admin
// @descripcion: Quita la última advertencia a un usuario mencionado

import { extraerMenciones, obtenerCitado } from '../../src/lib/utils.js';
import { query } from '../../src/lib/database.js';

export default async function (m, { isGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  let usuarioObjetivo = extraerMenciones(m)[0];
  const citado = obtenerCitado(m);

  if (!usuarioObjetivo && citado) {
    usuarioObjetivo = citado.jid;
  }

  if (!usuarioObjetivo) {
    return reply('⚠️ *¡Eh!* Menciona a alguien o responde a su mensajito para perdonarle 1 warn ~ 👼');
  }

  try {
    // Buscar la última advertencia de ese usuario en este grupo
    const res = await query(
      `SELECT id FROM advertencias WHERE jid_grupo = $1 AND jid_usuario = $2 ORDER BY fecha DESC LIMIT 1`,
      [m.key.remoteJid, usuarioObjetivo]
    );

    if (res.rows.length === 0) {
      return reply('✅ *¡Qué buen chic@!* Este usuario no tiene advertencias para borrar. 🌸');
    }

    const warnId = res.rows[0].id;
    await query(`DELETE FROM advertencias WHERE id = $1`, [warnId]);

    let txt = `╭ ꒰ 👼 𝓟𝓮𝓻𝓭𝓸𝓷 𝓚𝓪𝔀𝓪𝓲𝓲 👼 ꒱\n`;
    txt += `┊ ✨ Se le quitó 1 advertencia a @${usuarioObjetivo.split('@')[0]}.\n`;
    txt += `┊ 🌸 _¡Pórtate bien la próxima vez!_\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Hubo un error al intentar quitar la advertencia.');
  }
}
