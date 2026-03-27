// @nombre: antilink
// @alias: antilink
// @categoria: admin
// @descripcion: Configura el sistema antienlaces de WhatsApp

import { actualizarGrupo } from '../../src/lib/database.js';

export default async function (m, { args, isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');
  
  const accion = args[0]?.toLowerCase();

  if (accion === 'on' || accion === 'off') {
    const estado = accion === 'on';
    await actualizarGrupo(m.key.remoteJid, 'antilink', estado);
    
    let txt = `╭ ꒰ 🔗 𝓐𝓷𝓽𝓲-𝓛𝓲𝓷𝓴 🔗 ꒱\n`;
    txt += `┊ ✨ _Sistema ${estado ? '*Activado* ✅' : '*Desactivado* ❌'}~_\n`;
    if (estado) txt += `┊ 🔪 _¡Cuidado con los links intrusos!_\n`;
    txt += `╰ ꒰ 🛡️ 𝓢𝓮𝓰𝓾𝓻𝓲𝓭𝓪𝓭 🛡️ ꒱`;
    
    return reply(txt);
  }

  const estadoActual = dbGroup.antilink ? 'Activado ✅' : 'Desactivado ❌';
  let info = `╭ ꒰ 🔗 𝓐𝓷𝓽𝓲-𝓛𝓲𝓷𝓴 🔗 ꒱\n`;
  info += `┊ 🍡 *Estado:* ${estadoActual}\n`;
  info += `┊ 🍥 *Uso:* /antilink on | /antilink off\n`;
  info += `╰━━━━━━━━━━━━━━━━━ 🌸`;
  reply(info);
}
