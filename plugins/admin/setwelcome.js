// @nombre: setwelcome
// @alias: setwelcome, bienvenida
// @categoria: admin
// @descripcion: Configura el mensaje de bienvenida del grupo. Soporta saltos de línea reales.

import { actualizarGrupo } from '../../src/lib/database.js';

export default async function (m, { isGroup, text, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  if (!text) {
    let txt = `╭ ꒰ 🌸 𝓒𝓸𝓷𝓯𝓲𝓰𝓾𝓻𝓪𝓻 𝓑𝓲𝓮𝓷𝓿𝓮𝓷𝓲𝓭𝓪 🌸 ꒱\n`;
    txt += `┊ 🍡 *Uso:* /setwelcome [mensaje]\n`;
    txt += `┊ \n`;
    txt += `┊ ✨ *Variables mágicas:*\n`;
    txt += `┊ • *@user*  ➔ Menciona al nuev@\n`;
    txt += `┊ • *@group* ➔ Nombre del grupo\n`;
    txt += `┊ • *@desc*  ➔ Descripción del grupo\n`;
    txt += `┊ \n`;
    txt += `┊ 💡 Escribe el mensaje con *Shift+Enter* para saltos de línea.\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;
    return reply(txt);
  }

  // El texto ya contiene los saltos de línea reales (Shift+Enter en WhatsApp)

  try {
    await actualizarGrupo(m.key.remoteJid, 'msg_bienvenida', text);
    reply('✅ *¡Yay!* El mensaje de bienvenida se ha guardado bonito y correctamente~ 🌸');
  } catch (error) {
    console.error(error);
    reply('❌ *Aww...* Hubo un problemita guardando el mensaje 🥺');
  }
}
