// @nombre: setbanner
// @alias: setmenubanner
// @categoria: subbots
// @descripcion: Cambiar la imagen o video del banner del menú.
// @reaccion: 🌌

import { downloadMediaMessage } from '@itsukichann/baileys';
import { subirArchivoConFallback } from '../../src/lib/local-storage.js';
import { query, setBotConfig } from '../../src/lib/database.js';

export default async function(m, ctx) {
  // Temporalmente permitimos que cualquier administrador o el dueño cambie el banner
  // Esto soluciona los problemas de detección de dueño en sub-bots mientras se estabiliza el sistema.
  const { conn, reply, isOwner, isGroup } = ctx;

  let canChange = isOwner; // Dueño principal siempre puede

  if (isGroup) {
    try {
      const metadata = await conn.groupMetadata(m.key.remoteJid);
      const participant = metadata.participants.find(p => p.id === m.sender);
      if (participant?.admin) canChange = true; // Admins de grupo pueden
    } catch (e) {}
  }

  if (!canChange) {
    return reply('❌ *¡Oops!* Por ahora, solo los administradores o el dueño principal pueden cambiar el banner. 🌸');
  }

  const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const msgType = quoted ? Object.keys(quoted)[0] : Object.keys(m.message || {})[0];

  if (!/(image|video)Message/.test(msgType)) {
    return reply('⚠️ *¡Ay!* Tienes que responder a una imagen o video con el comando `.setbanner`. 🌸');
  }

  const jid = conn.user.id.split(':')[0] + '@s.whatsapp.net';

  try {
    await reply('⏳ *Procesando...* Subiendo archivo a múltiples servicios. 🌸');

    // Descargar imagen/video correctamente
    const buffer = await downloadMediaMessage(
      quoted ? { message: quoted } : m,
      'buffer',
      {},
      { logger: console, reuploadRequest: conn.updateMediaMessage }
    );

    if (!buffer) {
      return reply('❌ *Error:* No se pudo descargar el archivo. Asegúrate de responder a una imagen o video válida.');
    }

    console.log(`📁 Buffer descargado, tamaño: ${buffer.length} bytes`);

    // Determinar extensión y tipo de archivo
    const ext = msgType === 'videoMessage' ? 'mp4' : 'png';
    const fileName = `banner_${Date.now()}.${ext}`;
    const fileType = msgType === 'videoMessage' ? 'video' : 'image';

    console.log(`📤 Iniciando subida multi-servicio: ${fileName} (${fileType})`);

    const url = await subirArchivoMultiServicio(buffer, fileName, fileType);
    
    if (!url) {
      return reply('❌ *Error:* No se pudo subir el archivo a ningún servicio. Intenta con:\n\n• Una imagen más pequeña (menos de 5MB)\n• Un formato diferente (JPG, PNG)\n• Vuelve a intentarlo en unos minutos\n\n🌸 Si el problema persiste, contacta al administrador.');
    }

    console.log(`✅ URL obtenida: ${url}`);

    if (conn.isSubbot) {
      // Si es un subbot, actualizamos su registro individual
      await query("UPDATE subbots SET banner = $1 WHERE jid = $2", [url, jid]);
      console.log('📝 Banner actualizado en tabla subbots');
    } else {
      // Si es el bot principal, actualizamos la configuración global
      await setBotConfig('banner_menu', url);
      console.log('📝 Banner actualizado en configuración global');
    }

    await reply(`✅ *¡Qué chimba!* El banner del menú ha sido actualizado exitosamente.\n\n🔗 *URL:* ${url}\n\n🌸 ¡Listo para usar en el menú! ✨`);
  } catch (e) {
    console.error('🚫 Error en setbanner:', e);
    const errorMsg = e.response?.data || e.message || 'Error desconocido';
    await reply(`❌ *Error inesperado:* ${errorMsg}\n\n💡 *Solución:* Intenta con una imagen más pequeña o vuelve a intentarlo en unos minutos.`);
  }
}
