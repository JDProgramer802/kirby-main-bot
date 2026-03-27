// @nombre: bot
// @alias: bot
// @categoria: admin
// @descripcion: Activa o desactiva el bot en el grupo actual

import { actualizarGrupo } from '../../src/lib/database.js';

export default async function (m, { args, isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');
  
  const accion = args[0]?.toLowerCase();

  if (accion === 'on' || accion === 'off') {
    const estado = accion === 'on';
    await actualizarGrupo(m.key.remoteJid, 'bot_activo', estado);
    
    let txt = `╭ ꒰ 🎀 𝓚𝓲𝓻𝓫𝔂 𝓑𝓸𝓽 🎀 ꒱\n`;
    txt += `┊ ✨ _El botcito ha sido ${estado ? '*Activado* ✅' : '*Desactivado* ❌'} aquí!_\n`;
    txt += `╰ ꒰ 🍓 𝓒𝓸𝓷𝓯𝓲𝓰𝓾𝓻𝓪𝓬𝓲𝓸𝓷 🍓 ꒱`;
    
    return reply(txt);
  }

  const estadoActual = dbGroup.bot_activo ? 'Activado ✅' : 'Desactivado ❌';
  let info = `╭ ꒰ 🎀 𝓔𝓼𝓽𝓪𝓭𝓸 𝓭𝓮𝓵 𝓑𝓸𝓽 🎀 ꒱\n`;
  info += `┊ 🍡 *Estado:* ${estadoActual}\n`;
  info += `┊ 🍥 *Uso:* /bot on | /bot off\n`;
  info += `╰━━━━━━━━━━━━━━━━━ 🌸`;
  reply(info);
}
