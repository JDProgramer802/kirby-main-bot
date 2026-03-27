// @nombre: promote
// @alias: promote, daradmin
// @categoria: admin
// @descripcion: Otorga rango de Administrador a un usuario mencionado o citado

import { extraerMenciones, obtenerCitado } from '../../src/lib/utils.js';

export default async function (m, { conn, isGroup, reply, sender }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  try {
    const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const metadata = await conn.groupMetadata(m.key.remoteJid);
    const botParticipant = metadata.participants.find(p => p.id === botJid);
    
    if (!botParticipant?.admin) {
      return reply('❌ *Aww...* Necesito ser Administrador para promover a los amiguitos. 🥺');
    }

    let usuariosAPromover = extraerMenciones(m);
    
    if (usuariosAPromover.length === 0) {
      const citado = obtenerCitado(m);
      if (citado) {
        usuariosAPromover.push(citado.jid);
      }
    }

    if (usuariosAPromover.length === 0) {
      return reply('⚠️ *¡Eh!* Menciona a alguien o responde a su mensajito con /promote ~ ⭐');
    }

    await conn.groupParticipantsUpdate(
      m.key.remoteJid, 
      usuariosAPromover,
      'promote'
    );

    const texto = usuariosAPromover.map(u => `@${u.split('@')[0]}`).join(', ');
    
    let mensaje = `╭ ꒰ 🌟 𝓟𝓻𝓸𝓶𝓸𝓬𝓲𝓸𝓷 𝓜𝓪𝓰𝓲𝓬𝓪 🌟 ꒱\n`;
    mensaje += `┊ ✨ ¡Felicidades, ${texto}!\n`;
    mensaje += `┊ 👑 _Ahora eres Administrador del grupo._\n`;
    mensaje += `┊ 🍡 _¡Usa tu poder con sabiduría y dulzura!_\n`;
    mensaje += `╰━━━━━━━━━━━━━━━━━ 💖`;

    await conn.sendMessage(m.key.remoteJid, {
      text: mensaje,
      mentions: usuariosAPromover
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    reply('❌ *Oh no...* Hubo un error al dar admin a este amiguito. 😿');
  }
}
