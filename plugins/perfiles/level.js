// @nombre: level
// @alias: level, nivel, rank
// @categoria: perfiles
// @descripcion: Muestra tu nivel y experiencia actual de forma rápida. (Uso: /level)

import { query } from '../../src/lib/database.js';
import { extraerMenciones } from '../../src/lib/utils.js';

export default async function (m, { sender, reply }) {
  let objetivo = extraerMenciones(m)[0] || sender;

  try {
    const res = await query(`SELECT nivel, xp FROM usuarios WHERE jid = $1`, [objetivo]);
    
    if (res.rows.length === 0) {
      return reply(`⚠️ *¡Ey!* Ese usuario no está registrado aún. 👻`);
    }

    const { nivel, xp } = res.rows[0];
    
    // Calcular XP necesario para el próximo nivel
    // Fórmula base: nivel * 100
    const xpSiguienteNivel = nivel * 100;
    const falta = xpSiguienteNivel - xp;

    let txt = `╭ ꒰ 🌟 𝓡𝓪𝓷𝓰𝓸 🌟 ꒱\n`;
    txt += `┊ 👤 *Usuario:* @${objetivo.split('@')[0]}\n`;
    txt += `┊ 🆙 *Nivel:* ${nivel}\n`;
    txt += `┊ ⚡ *XP Actual:* ${xp} / ${xpSiguienteNivel}\n`;
    txt += `┊ 🎯 _Te faltan ${falta} XP para subir._\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El scouter de energía explotó.');
  }
}
