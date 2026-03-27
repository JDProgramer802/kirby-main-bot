// @nombre: onlyadmin
// @alias: onlyadmin, soloadmin
// @categoria: admin
// @descripcion: Activa el modo de solo administradores en el grupo

import { actualizarGrupo } from '../../src/lib/database.js';

export default async function (m, { args, isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  const accion = args[0]?.toLowerCase();

  if (accion === 'on' || accion === 'off') {
    const estado = accion === 'on';
    await actualizarGrupo(m.key.remoteJid, 'solo_admin', estado);
    
    let txt = `╭ ꒰ 👑 𝓞𝓷𝓵𝔂 𝓐𝓭𝓶𝓲𝓷 👑 ꒱\n`;
    txt += `┊ ✨ _Modo Solo-Admins ${estado ? '*Activado* ✅' : '*Desactivado* ❌'}._\n`;
    txt += `┊ 🧸 _${estado ? 'Solo los jefes mandan acá~' : '¡Todos pueden jugar ahora!'}_\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 👑`;
    
    return reply(txt);
  }

  const estadoActual = dbGroup.solo_admin ? 'Activado ✅' : 'Desactivado ❌';
  let info = `╭ ꒰ 👑 𝓞𝓷𝓵𝔂 𝓐𝓭𝓶𝓲𝓷 👑 ꒱\n`;
  info += `┊ 🍡 *Estado:* ${estadoActual}\n`;
  info += `┊ 🍥 *Uso:* /onlyadmin on | /onlyadmin off\n`;
  info += `╰━━━━━━━━━━━━━━━━━ 👑`;
  reply(info);
}
