// @nombre: demote
// @alias: demote, quitaradmin
// @categoria: admin
// @descripcion: Quita el rango de Administrador a un usuario mencionado o citado

import { extraerMenciones, obtenerCitado } from '../../src/lib/utils.js';

export default async function (m, { conn, isGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  try {
    const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const metadata = await conn.groupMetadata(m.key.remoteJid);
    const botParticipant = metadata.participants.find(p => p.id === botJid);
    
    if (!botParticipant?.admin) {
      return reply('❌ *Aww...* Necesito ser Administrador para quitar permisos. 🥺');
    }

    let usuariosADegradar = extraerMenciones(m);
    
    if (usuariosADegradar.length === 0) {
      const citado = obtenerCitado(m);
      if (citado) {
        usuariosADegradar.push(citado.jid);
      }
    }

    if (usuariosADegradar.length === 0) {
      return reply('⚠️ *¡Eh!* Menciona a alguien o responde a su mensajito con /demote ~ 🔻');
    }

    await conn.groupParticipantsUpdate(
      m.key.remoteJid, 
      usuariosADegradar,
      'demote'
    );

    const texto = usuariosADegradar.map(u => `@${u.split('@')[0]}`).join(', ');
    
    let mensaje = `╭ ꒰ 🔻 𝓓𝓮𝓰𝓻𝓪𝓭𝓪𝓬𝓲𝓸𝓷 🔻 ꒱\n`;
    mensaje += `┊ 🍂 ${texto} ya no es Administrador.\n`;
    mensaje += `┊ ☁️ _El poder se te ha escapado de las manitos..._\n`;
    mensaje += `╰━━━━━━━━━━━━━━━━━ 💔`;

    await conn.sendMessage(m.key.remoteJid, {
      text: mensaje,
      mentions: usuariosADegradar
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    reply('❌ *Oh no...* Hubo un error. Recuerda que el creador del grupo no puede ser degradado. 😿');
  }
}
