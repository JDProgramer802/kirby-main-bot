// @nombre: alerts
// @alias: alerts, alertas
// @categoria: admin
// @descripcion: Activa o desactiva las notificaciones de bienvenidas y despedidas

import { actualizarGrupo } from '../../src/lib/database.js';

export default async function (m, { args, isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  const accion = args[0]?.toLowerCase();

  if (accion === 'on' || accion === 'off') {
    const estado = accion === 'on';
    await actualizarGrupo(m.key.remoteJid, 'bienvenida', estado);
    await actualizarGrupo(m.key.remoteJid, 'despedida', estado);
    
    let txt = `╭ ꒰ 📢 𝓐𝓵𝓮𝓻𝓽𝓪𝓼 𝓭𝓮 𝓖𝓻𝓾𝓹𝓸 📢 ꒱\n`;
    txt += `┊ ✨ _Notificaciones de entradas y salidas han sido ${estado ? '*Activadas* ✅' : '*Desactivadas* ❌'}._\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;
    
    return reply(txt);
  }

  const estadoBienvenida = dbGroup.bienvenida ? 'Activadas ✅' : 'Desactivadas ❌';
  const estadoDespedida = dbGroup.despedida ? 'Activadas ✅' : 'Desactivadas ❌';
  
  let info = `╭ ꒰ 📢 𝓐𝓵𝓮𝓻𝓽𝓪𝓼 𝓭𝓮 𝓖𝓻𝓾𝓹𝓸 📢 ꒱\n`;
  info += `┊ 🌸 *Bienvenidas:* ${estadoBienvenida}\n`;
  info += `┊ 🍂 *Despedidas:* ${estadoDespedida}\n`;
  info += `┊ 🍥 *Uso:* /alerts on | /alerts off\n`;
  info += `╰━━━━━━━━━━━━━━━━━ 💕`;
  reply(info);
}
