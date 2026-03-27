// @nombre: setwarnlimit
// @alias: setwarnlimit, limitewarn
// @categoria: admin
// @descripcion: Establece cuántas advertencias se necesitan para expulsar a alguien

import { actualizarGrupo } from '../../src/lib/database.js';

export default async function (m, { args, isGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  const limite = parseInt(args[0]);
  if (isNaN(limite) || limite < 1 || limite > 10) {
    return reply('⚠️ *¡Eh!* Debes especificar un límite válido entre 1 y 10. `Ejemplo: /setwarnlimit 3` 🌸');
  }

  try {
    await actualizarGrupo(m.key.remoteJid, 'limite_warns', limite);
    
    let txt = `╭ ꒰ ⚖️ 𝓛𝓲𝓶𝓲𝓽𝓮 𝓭𝓮 𝓦𝓪𝓻𝓷𝓼 ⚖️ ꒱\n`;
    txt += `┊ ✨ _El límite ha sido establecido a ${limite}._\n`;
    txt += `┊ 🔪 _Avisados están los chicos malos..._\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Hubo un error al guardar el límite.');
  }
}
