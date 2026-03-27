// @nombre: setbirthday
// @alias: setbirthday, micumple, cumpleanos
// @categoria: perfiles
// @descripcion: Añade tu fecha de cumpleaños a tu perfil. (Uso: /micumple DD/MM)

import { query } from '../../src/lib/database.js';

export default async function (m, { text, sender, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime qué día cumples años. Usa Día/Mes.\n`Ejemplo: /micumple 15/04` para 15 de Abril. 🌸');
  }

  // Validación básica
  const regex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])$/;
  if (!regex.test(text.trim())) {
    return reply('❌ *Uh oh...* Ese formato no parece un día y mes real. Usa `DD/MM`, por ejemplo `05/12`. 🎂');
  }

  try {
    await query(`UPDATE usuarios SET cumpleanos = $1 WHERE jid = $2`, [text.trim(), sender]);

    let txt = `╭ ꒰ 🎂 𝓒𝓾𝓶𝓹𝓵𝓮𝓪𝓷𝓸𝓼 🎂 ꒱\n`;
    txt += `┊ ✨ ¡Anotado en el calendario mágico!\n`;
    txt += `┊ 💖 Celebraré contigo el *${text.trim()}*.\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Se derramó el pastel en la tarjeta mágiza y no pude guardarlo.');
  }
}
