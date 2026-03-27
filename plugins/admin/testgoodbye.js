// @nombre: testgoodbye
// @alias: testg, probardespedida, testbye
// @categoria: admin
// @descripcion: Prueba el mensaje de despedida configurado en el grupo.

import { obtenerGrupo } from '../../src/lib/database.js';
import { toSmallCaps } from '../../src/lib/utils.js';

export default async function (m, { conn, isOwner, isAdmin }) {
  if (!m.isGroup) return m.reply('Este comando solo funciona en grupos.');
  if (!isAdmin && !isOwner) return m.reply('Solo administradores.');

  const dbGroup = await obtenerGrupo(m.chat);
  if (!dbGroup) return m.reply('❌ No se pudo obtener la configuración del grupo.');
  if (!dbGroup.despedida) return m.reply('⚠️ La despedida está desactivada. Úsa /goodbye on para activarla.');

  const metadata = await conn.groupMetadata(m.chat);
  const groupName = metadata.subject;
  const participant = m.sender;

  let msg = (dbGroup.msg_despedida || '¡Adiós @user! Te extrañaremos en @group 👋')
    .replace(/@user/g, `@${participant.split('@')[0]}`)
    .replace(/@group/g, groupName);

  await conn.sendMessage(m.chat, { 
    text: msg, 
    mentions: [participant],
    contextInfo: {
      externalAdReply: {
        title: `✦ ${toSmallCaps('ᴘʀᴜᴇʙᴀ ᴅᴇ ᴅᴇꜱᴘᴇᴅɪᴅᴀ')} ✦`,
        body: groupName,
        thumbnailUrl: await conn.profilePictureUrl(m.chat, 'image').catch(() => null),
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });
}
