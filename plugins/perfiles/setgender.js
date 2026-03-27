// @nombre: setgender
// @alias: setgender, degenero, migenero
// @categoria: perfiles
// @descripcion: Especifica tu género pincipal en tu perfil. (Uso: /setgender Chico/Chica/No-Binario/etc.)

import { query } from '../../src/lib/database.js';

export default async function (m, { text, sender, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime cómo te identificas para tu biografía.\n`Ejemplo: /setgender Chico Kawaii` 🌸');
  }

  if (text.length > 25) {
    return reply('❌ *¡Uh oh!* Intenta no usar un texto tan largo para el género. (Máximo 25 letras) 🎀');
  }

  try {
    await query(`UPDATE usuarios SET genero = $1 WHERE jid = $2`, [text.trim(), sender]);

    let txt = `╭ ꒰ ⚧️ 𝓘𝓭𝓮𝓷𝓽𝓲𝓭𝓪𝓭 ⚧️ ꒱\n`;
    txt += `┊ ✨ ¡Todo listo!\n`;
    txt += `┊ 💖 Género guardado: *${text.trim()}*\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Error guardando en las tarjetas mágicas.');
  }
}
