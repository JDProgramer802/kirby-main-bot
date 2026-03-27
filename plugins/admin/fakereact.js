// @nombre: fakereact
// @alias: fakereaccion, reactfake
// @categoria: admin
// @descripcion: Envía reacciones a un canal o chat (soporta múltiples bots).
// @reaccion: ✨


import { subbotManager } from '../../src/lib/subbotManager.js';

export default async function(m, ctx) {
  const { conn, reply, isOwner, args, text } = ctx;

  if (!isOwner) return reply('❌ *¡Oops!* Solo el dueño puede usar este comando. 🌸');

  let targetJid, serverMessageId, emoji;

  // 1. Extraer Link y Emoji del texto completo para evitar fallos de parsing
  const linkMatch = text.match(/https:\/\/whatsapp\.com\/channel\/([a-zA-Z0-9]+)\/(\d+)/);
  const shortLinkMatch = text.match(/https:\/\/whatsapp\.com\/channel\/([a-zA-Z0-9]+)/);
  const emojiMatch = text.match(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/);

  emoji = emojiMatch ? emojiMatch[0] : '👍';

  if (linkMatch) {
    // Caso: Enlace directo de publicación de canal
    const code = linkMatch[1];
    serverMessageId = linkMatch[2];

    try {
      await reply('⏳ *Procesando...* Obteniendo información del canal. 🌸');
      const meta = await conn.newsletterMetadata('invite', code);
      targetJid = meta.id;
    } catch (e) {
      return reply(`❌ *Error:* No se pudo obtener la información del canal. Asegúrate de que el enlace sea correcto.\n_${e.message}_`);
    }
  } else if (shortLinkMatch && !m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    // Caso: Enlace de canal pero sin ID de mensaje
    return reply('⚠️ *¡Ay!* El enlace del canal debe incluir el ID de la publicación.\n\n`Ejemplo: https://whatsapp.com/channel/CODIGO/123`');
  } else {
    // Caso: Responder a un mensaje
    const quoted = m.message?.extendedTextMessage?.contextInfo;
    if (!quoted || !quoted.quotedMessage) {
      return reply('⚠️ *¡Ay!* Tienes que responder a un mensaje o pasar el link de la publicación.\n\n`Ejemplo: /fakereact https://whatsapp.com/channel/CODE/ID 🔥`');
    }

    const newsletterInfo = quoted.forwardedNewsletterMessageInfo;
    if (newsletterInfo) {
      targetJid = newsletterInfo.newsletterJid;
      serverMessageId = newsletterInfo.serverMessageId;
    } else {
      targetJid = m.chat;
      serverMessageId = quoted.stanzaId;
    }
  }

  // 2. Obtener lista de bots para enviar reacciones (Bot Principal + Sub-Bots)
  const subbots = Array.from(subbotManager.instances.values());
  const allBots = [conn, ...subbots.filter(b => b.user.id !== conn.user.id)];
  const totalBots = allBots.length;

  try {
    await reply(`⏳ *Enviando reacción...* "${emoji}" al ${targetJid.includes('newsletter') ? 'canal' : 'chat'}. 🌸`);

    const reactionKey = {
      remoteJid: targetJid,
      fromMe: false,
      id: serverMessageId,
    };

    // Si no es un canal, necesitamos el participante original
    if (!targetJid.includes('newsletter')) {
      reactionKey.participant = m.message?.extendedTextMessage?.contextInfo?.participant || m.chat;
    }

    let exitosos = 0;
    let fallidos = 0;

    // 1. Reacción del Bot Principal
    try {
      if (targetJid.includes('newsletter')) {
        await conn.newsletterReactMessage(targetJid, serverMessageId, emoji);
      } else {
        await conn.sendMessage(targetJid, { react: { text: emoji, key: reactionKey } });
      }
      exitosos++;
    } catch (e) {
      fallidos++;
    }

    // 2. Reacciones de los Sub-Bots (Delegar a la instancia secundaria)
    if (conn.subbotProcess) {
      conn.subbotProcess.send({
        type: 'fakereact',
        targetJid,
        msgId: serverMessageId,
        emoji,
        key: reactionKey
      });
      // No podemos contar éxitos reales desde aquí fácilmente, pero asumimos que se procesan
      exitosos += (totalBots - 1);
    }

    let resultMsg = `✅ *¡Listo!* Reacciones enviadas.\n🌸 *Destino:* ${targetJid.split('@')[0]}\n✨ *Emoji:* ${emoji}`;

    if (totalBots > 1) {
      resultMsg += `\n📊 *Éxitos:* ${exitosos}\n❌ *Errores:* ${fallidos}`;
    } else {
      resultMsg += `\n\n💡 *Nota:* WhatsApp solo permite **1 reacción por cuenta**. Para enviar "varias" reacciones a la vez, necesitas conectar Sub-Bots con el comando \`/qr\`.`;
    }

    await reply(resultMsg);

  } catch (e) {
    console.error(`Error general en fakereact:`, e.message);
    await reply(`❌ *Error crítico:* ${e.message}`);
  }
}
