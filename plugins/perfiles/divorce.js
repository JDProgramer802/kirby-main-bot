// @nombre: divorce
// @alias: divorce, divorcio, divorciar
// @categoria: perfiles
// @descripcion: Rómpes el corazón de tu pareja y te divorcias. (Uso: /divorce)

import { query } from '../../src/lib/database.js';

export default async function (m, { sender, reply }) {
  try {
    const res = await query(`SELECT pareja FROM usuarios WHERE jid = $1`, [sender]);
    
    if (res.rows.length === 0 || !res.rows[0].pareja) {
      return reply('⚠️ *¡Ay!* ¡Pero si estás soltero/a! No puedes divorciarte del aire. 😂');
    }

    const exPareja = res.rows[0].pareja;

    // Romper el lazo
    await query(`UPDATE usuarios SET pareja = NULL WHERE jid = $1`, [sender]);
    await query(`UPDATE usuarios SET pareja = NULL WHERE jid = $1`, [exPareja]);

    let txt = `╭ ꒰ 💔 𝓓𝓲𝓿𝓸𝓻𝓬𝓲𝓸 💔 ꒱\n`;
    txt += `┊ 🌧️ Es un día gris...\n`;
    txt += `┊ 🔪 @${sender.split('@')[0]} ha terminado su relación con @${exPareja.split('@')[0]}.\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 🥀`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El abogado no llegó a tiempo.');
  }
}
