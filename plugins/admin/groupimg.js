// @nombre: groupimg
// @alias: groupimg, seticon, foto
// @categoria: admin
// @descripcion: Cambia la imagen del grupo usando la imagen enviada o citada

import { downloadMediaMessage } from '@itsukichann/baileys';

export default async function (m, { conn, isGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  // Evaluar permisos de admin
  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  const metadata = await conn.groupMetadata(m.key.remoteJid);
  const botParticipant = metadata.participants.find(p => p.id === botJid);
  
  if (!botParticipant?.admin) {
    return reply('❌ *Aww...* Necesito ser Administrador para poder cambiar la fotito. 🥺');
  }

  // Comprobar si hay una imagen
  let targetMessage = m;
  let isQuoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  
  if (isQuoted) {
    targetMessage = {
      message: isQuoted
    };
  }

  const type = Object.keys(targetMessage.message || {})[0];
  if (type !== 'imageMessage') {
    return reply('📸 *¡Uff!* Debes enviar o responder a una imagen con `/groupimg`.');
  }

  try {
    const buffer = await downloadMediaMessage(targetMessage, 'buffer', {});

    // Cambiar la imagen del grupo
    await conn.updateProfilePicture(m.key.remoteJid, buffer);

    let txt = `╭ ꒰ 📸 𝓘𝓶𝓪𝓰𝓮𝓷 𝓭𝓮 𝓖𝓻𝓾𝓹𝓸 📸 ꒱\n`;
    txt += `┊ ✨ _¡Fotito actualizada con éxito!_\n`;
    txt += `┊ 💖 _Qué lindo se ve el grupo ahora._\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (error) {
    console.error(error);
    reply('❌ *Oh no...* Hubo un problema al procesar la imagencita. 😿');
  }
}
