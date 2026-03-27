// @nombre: setbio
// @alias: setbio, mibio, biografia
// @categoria: perfiles
// @descripcion: Escribe tu pequeña biografía mágica en tu perfil. (Uso: /setbio [Texto])

import { query } from '../../src/lib/database.js';

export default async function (m, { text, sender, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime qué quieres escribir en tu biografía. `Ejemplo: /setbio Amante del anime y el pan` 🌸');
  }

  if (text.length > 150) {
    return reply('❌ *¡Uh oh!* Tu biografía es muy larga... Intenta resumirla a 150 caracteres. 🎀');
  }

  try {
    await query(`UPDATE usuarios SET descripcion = $1 WHERE jid = $2`, [text.trim(), sender]);

    let txt = `╭ ꒰ 📖 𝓑𝓲𝓸𝓰𝓻𝓪𝓯𝓲𝓪 𝓐𝓬𝓽𝓾𝓪𝓵𝓲𝔃𝓪𝓭𝓪 📖 ꒱\n`;
    txt += `┊ ✨ ¡Escritura exitosa!\n`;
    txt += `┊ 💖 Ahora tu perfil dice: _"${text.trim()}"_\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El libro de registro se cerró de golpe.');
  }
}
