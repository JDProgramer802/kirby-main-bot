// @nombre: gacha
// @alias: gacha, anime
// @categoria: admin
// @descripcion: Activa o desactiva los comandos de gacha (AniList) en el grupo

import { actualizarGrupo } from '../../src/lib/database.js';

export default async function (m, { args, isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  const accion = args[0]?.toLowerCase();

  if (accion === 'on' || accion === 'off') {
    const estado = accion === 'on';
    await actualizarGrupo(m.key.remoteJid, 'gacha_activo', estado);
    
    let txt = `╭ ꒰ 🎴 𝓖𝓪𝓬𝓱𝓪 𝓐𝓷𝓲𝓶𝓮 🎴 ꒱\n`;
    txt += `┊ ✨ _El coleccionismo de waifus/husbandos está ${estado ? '*Activado* ✅' : '*Desactivado* ❌'}._\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 🎌`;
    
    return reply(txt);
  }

  const estadoActual = dbGroup.gacha_activo ? 'Activado ✅' : 'Desactivado ❌';
  let info = `╭ ꒰ 🎴 𝓖𝓪𝓬𝓱𝓪 𝓐𝓷𝓲𝓶𝓮 🎴 ꒱\n`;
  info += `┊ 🍡 *Estado:* ${estadoActual}\n`;
  info += `┊ 🍥 *Uso:* /gacha on | /gacha off\n`;
  info += `╰━━━━━━━━━━━━━━━━━ 💕`;
  reply(info);
}
