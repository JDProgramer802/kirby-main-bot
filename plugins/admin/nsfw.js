// @nombre: nsfw
// @alias: nsfw
// @categoria: admin
// @descripcion: Habilita el contenido +18 en el grupo

import { actualizarGrupo } from '../../src/lib/database.js';
import config from '../../src/lib/config.js';

export default async function (m, { args, isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');
  if (config.nsfwGlobal) return reply('⚠️ *Ahhh~* El NSFW ya está activado globalmente 🙈');

  const accion = args[0]?.toLowerCase();

  if (accion === 'on' || accion === 'off') {
    const estado = accion === 'on';
    await actualizarGrupo(m.key.remoteJid, 'nsfw', estado);
    
    let txt = `╭ ꒰ 🔞 𝓝𝓢𝓕𝓦 𝓜𝓸𝓭𝓮 🔞 ꒱\n`;
    txt += `┊ 💋 _Los comandos para adultos han sido ${estado ? '*Activados* 😈' : '*Desactivados* ⛪'}._\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;
    
    return reply(txt);
  }

  const estadoActual = dbGroup.nsfw ? 'Activado 😈' : 'Desactivado ⛪';
  let info = `╭ ꒰ 🔞 𝓝𝓢𝓕𝓦 𝓜𝓸𝓭𝓮 🔞 ꒱\n`;
  info += `┊ 🍡 *Estado:* ${estadoActual}\n`;
  info += `┊ 🍥 *Uso:* /nsfw on | /nsfw off\n`;
  info += `╰━━━━━━━━━━━━━━━━━ 💕`;
  reply(info);
}
