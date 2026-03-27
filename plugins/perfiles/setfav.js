// @nombre: setfav
// @alias: setfav, micanal, animefav
// @categoria: perfiles
// @descripcion: Escribe tu anime / manga o hobby favorito en tu perfil. (Uso: /setfav [Favorito])

import { query } from '../../src/lib/database.js';

export default async function (m, { text, sender, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime cuál es tu anime/manga o hobby favorito. `Ejemplo: /setfav Ver Kirby abrazar estrellitas` 🌸');
  }

  if (text.length > 50) {
    return reply('❌ *¡Uh oh!* Tu favorito es muy largo... Intenta resumirlo a 50 caracteres. 🎀');
  }

  try {
    await query(`UPDATE usuarios SET favorito = $1 WHERE jid = $2`, [text.trim(), sender]);

    let txt = `╭ ꒰ ⭐ 𝓕𝓪𝓿𝓸𝓻𝓲𝓽𝓸 ⭐ ꒱\n`;
    txt += `┊ ✨ ¡Anotado en las estrellas!\n`;
    txt += `┊ 💖 Tu favorito ahora es: *${text.trim()}*\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El registro mágico falló.');
  }
}
