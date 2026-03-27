// @nombre: delclaimmsg
// @alias: delclaimmsg, borrarclaimmsg
// @categoria: gacha
// @descripcion: Elimina tu mensaje personalizado de reclamo.

import { query } from '../../src/lib/database.js';

export default async function (m, { sender, reply }) {
  try {
    await query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS claim_msg TEXT;`);
    await query(`UPDATE usuarios SET claim_msg = NULL WHERE jid = $1`, [sender]);

    let txt = `╭ ꒰ 🗑️ 𝓜𝓮𝓷𝓼𝓪𝓳𝓮 𝓑𝓸𝓻𝓻𝓪𝓭𝓸 🗑️ ꒱\n`;
    txt += `┊ ✨ Mensaje de captura restablecido a la normalidad.\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Hubo un error borrando tu frascecita.');
  }
}
