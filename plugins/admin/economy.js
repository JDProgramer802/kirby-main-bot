// @nombre: economy
// @alias: economy, economia
// @categoria: admin
// @descripcion: Activa o desactiva los comandos de economía en el grupo

import { actualizarGrupo } from '../../src/lib/database.js';

export default async function (m, { args, isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  const accion = args[0]?.toLowerCase();

  if (accion === 'on' || accion === 'off') {
    const estado = accion === 'on';
    await actualizarGrupo(m.key.remoteJid, 'economia_activa', estado);
    
    let txt = `╭ ꒰ 💰 𝓔𝓬𝓸𝓷𝓸𝓶𝓲𝓪 💰 ꒱\n`;
    txt += `┊ ✨ _Los juegos de dinero han sido ${estado ? '*Activados* ✅' : '*Desactivados* ❌'}._\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💵`;
    
    return reply(txt);
  }

  const estadoActual = dbGroup.economia_activa ? 'Activada ✅' : 'Desactivada ❌';
  let info = `╭ ꒰ 💰 𝓔𝓬𝓸𝓷𝓸𝓶𝓲𝓪 💰 ꒱\n`;
  info += `┊ 🍡 *Estado:* ${estadoActual}\n`;
  info += `┊ 🍥 *Uso:* /economy on | /economy off\n`;
  info += `╰━━━━━━━━━━━━━━━━━ 💕`;
  reply(info);
}
