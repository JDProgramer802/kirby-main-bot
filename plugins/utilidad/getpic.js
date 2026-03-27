// @nombre: getpic
// @alias: pfp
// @categoria: utilidad
// @descripcion: Ver la foto de perfil de un usuario.
// @reaccion: 📸

import { kirbyBox, separador } from '../../src/lib/utils.js';

export default async function(m, { conn, args, reply, sender, isGroup }) {
  let userId = sender;
  if (isGroup && args.length > 0) {
    const mention = args[0].replace(/[^0-9@.]/g, '');
    if (mention) userId = mention.includes('@') ? mention : `${mention}@s.whatsapp.net`;
    if (userId && !userId.endsWith('@s.whatsapp.net')) userId = `${userId}@s.whatsapp.net`;
  }

  try {
    const ppUrl = await conn.profilePictureUrl(userId, 'image');
    if (!ppUrl) {
      return reply(`${separador('🌸')}\n${kirbyBox('Mmm...', ['No pude encontrar la foto de perfil de ese usuario.'], 'Asegúrate de mencionarlo')}\n${separador('🌸')}`);
    }

    await conn.sendMessage(m.key.remoteJid, {
      image: { url: ppUrl },
      caption: `✨ ${kirbyBox('Foto de perfil', [`📸 ${userId.split('@')[0]}`], 'Dreamland')}`
    }, { quoted: m });
  } catch (err) {
    console.error('getpic error', err);
    await reply(`${separador('❗')}\n${kirbyBox('Error', ['No se pudo obtener la foto de perfil.'], 'Revisa permisos') }\n${separador('❗')}`);
  }
}

