// @nombre: setclaimmsg
// @alias: setclaimmsg, msgclaim
// @categoria: gacha
// @descripcion: Personaliza el mensaje que dirá el bot cuando reclames a una waifu/husbando.

import { query, obtenerUsuario } from '../../src/lib/database.js';

export default async function (m, { text, sender, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime qué mensaje quieres que el bot grite cuando reclames.\n`Ejemplo: /setclaimmsg "Ven a mis brazos {name}"`\nUsar {name} para el nombre del personaje. 🌸');
  }

  try {
    await query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS claim_msg TEXT;`);
    await query(`UPDATE usuarios SET claim_msg = $1 WHERE jid = $2`, [text.trim(), sender]);

    let txt = `╭ ꒰ 💬 𝓜𝓮𝓷𝓼𝓪𝓳𝓮 𝓟𝓮𝓻𝓼𝓸𝓷𝓪𝓵 💬 ꒱\n`;
    txt += `┊ ✨ Mensaje de captura guardado.\n`;
    txt += `┊ 💖 Ahora gritarás eso al reclamar.\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Hubo un error guardando tu frascecita.');
  }
}
