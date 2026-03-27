// @nombre: testwelcome
// @alias: testw, probarbienvenida
// @categoria: admin
// @descripcion: Prueba el mensaje de bienvenida configurado en el grupo.

import { toSmallCaps } from '../../src/lib/utils.js';

export default async function (m, ctx) {
  const { conn, isOwner, dbGroup, isGroup, sender, senderNumber, reply } = ctx;

  if (!isGroup) return reply('❌ Este comando solo funciona en grupos.');

  // Obtener administradores
  const metadata = await conn.groupMetadata(m.key.remoteJid);
  const participants = metadata.participants || [];
  const isAdmin = participants.find(p => p.id === sender)?.admin || false;

  if (!isAdmin && !isOwner) return reply('❌ Solo administradores.');

  try {
    if (!dbGroup) return reply('❌ No se pudo obtener la configuración del grupo.');

    if (!dbGroup.bienvenida) {
      return reply('⚠️ La bienvenida está desactivada. Usa /welcome on para activarla.');
    }

    const groupName = metadata.subject;
    const groupDesc = metadata.desc || 'Sin descripción';

    // ✨ Mensaje dinámico
    let msg = (dbGroup.msg_bienvenida || '¡Hola @user! Bienvenido a @group ✨')
      .replace(/@user/g, `@${senderNumber}`)
      .replace(/@group/g, groupName)
      .replace(/@desc/g, groupDesc);

    // 🖼️ Banner opcional
    const banner = dbGroup.banner_bienvenida || null;

    // 🌸 Preview bonito tipo Kirby
    const contextInfo = {
      externalAdReply: {
        title: `✦ ${toSmallCaps('PRUEBA DE BIENVENIDA')} ✦`,
        body: groupName,
        thumbnailUrl: banner || await conn.profilePictureUrl(m.key.remoteJid, 'image').catch(() => null),
        mediaType: 1,
        renderLargerThumbnail: true
      }
    };

    const mentions = [sender];

    // 🚀 Enviar mensaje
    if (banner) {
      await conn.sendMessage(m.key.remoteJid, {
        image: { url: banner },
        caption: msg,
        mentions,
        contextInfo
      }, { quoted: m });

    } else {
      await conn.sendMessage(m.key.remoteJid, {
        text: msg,
        mentions,
        contextInfo
      }, { quoted: m });
    }

  } catch (err) {
    console.error(err);
    reply('❌ Error al probar la bienvenida.');
  }
}
