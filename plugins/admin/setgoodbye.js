// @nombre: setgoodbye
// @alias: setgoodbye, despedida
// @categoria: admin
// @descripcion: Configura el mensaje de despedida del grupo. Soporta saltos de línea reales.

import { actualizarGrupo } from '../../src/lib/database.js';

export default async function (m, { isGroup, text, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  if (!text) {
    let txt = `╭ ꒰ 🍂 𝓒𝓸𝓷𝓯𝓲𝓰𝓾𝓻𝓪𝓻 𝓓𝓮𝓼𝓹𝓮𝓭𝓲𝓭𝓪 🍂 ꒱\n`;
    txt += `┊ 🍡 *Uso:* /setgoodbye [mensaje]\n`;
    txt += `┊ \n`;
    txt += `┊ ✨ *Variables mágicas:*\n`;
    txt += `┊ • *@user*  ➔ Menciona al que se fue\n`;
    txt += `┊ • *@group* ➔ Nombre del grupo\n`;
    txt += `┊ \n`;
    txt += `┊ 💡 Escribe el mensaje con *Shift+Enter* para saltos de línea.\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💔`;
    return reply(txt);
  }

  // El texto ya contiene los saltos de línea reales del usuario (Shift+Enter en WhatsApp)
  // No es necesario procesarlos — se guardan tal cual.
  try {
    await actualizarGrupo(m.key.remoteJid, 'msg_despedida', text);
    reply('✅ *¡Yay!* El mensaje de despedida quedó guardado y listo~ 🍂');
  } catch (error) {
    console.error(error);
    reply('❌ *Aww...* Hubo un problemita guardando el mensaje de despedida 🥺');
  }
}
