// @nombre: setbannerwel
// @alias: setbannerbienvenida, bannerwelcome, setbannerwelcome
// @categoria: admin
// @descripcion: Establece la imagen de banner para el mensaje de bienvenida del grupo.

import { actualizarGrupo } from '../../src/lib/database.js';
import { subirArchivoMultiServicio } from '../../src/lib/upload-apis.js';
import { downloadMediaMessage } from '@itsukichann/baileys';
import { log } from '../../src/lib/utils.js';

export default async function (m, { conn, isGroup, isAdmin, isOwner, reply }) {
  if (!isGroup) return reply('❌ Solo funciona en grupos.');
  if (!isAdmin && !isOwner) return reply('❌ Solo administradores.');

  try {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const mime = quoted ? Object.keys(quoted)[0] : Object.keys(m.message)[0];

    let buffer;
    if (quoted && /image/.test(mime)) {
      buffer = await downloadMediaMessage(
        { message: quoted }, 'buffer', {},
        { logger: console, reuploadRequest: conn.updateMediaMessage }
      );
    } else if (/image/.test(mime)) {
      buffer = await downloadMediaMessage(
        m, 'buffer', {},
        { logger: console, reuploadRequest: conn.updateMediaMessage }
      );
    } else {
      return reply('⚠️ Responde a una imagen o envíala junto con el comando /setbannerwel.');
    }

    if (!buffer) return reply('❌ No se pudo descargar la imagen.');

    await reply('⏳ *Subiendo banner de bienvenida...* 🌸✨');

    const fileName = `banner_wel_${Date.now()}.png`;
    const url = await subirArchivoMultiServicio(buffer, fileName, 'image');
    
    if (!url) {
      return reply('❌ Falló la subida a todos los servicios. Intenta con:\n\n• Una imagen más pequeña\n• Otro formato (JPG, PNG)\n• Vuelve a intentarlo en unos minutos');
    }

    // Guardar URL en la DB del grupo
    await actualizarGrupo(m.key.remoteJid, 'banner_bienvenida', url);

    const txt = `╭ ꒰ 🌸 𝓑𝓪𝓷𝓷𝓮𝓻 𝓓𝓮 𝓑𝓲𝓮𝓷𝓿𝓮𝓷𝓲𝓭𝓪 🌸 ꒱\n┊ ✨ ¡Banner de bienvenida actualizado!\n┊ 🖼️ *URL:* ${url}\n╰━━━━━━━━━━━━━━━━━ 💕`;

    await conn.sendMessage(m.key.remoteJid, {
      image: { url },
      caption: txt
    }, { quoted: m });

  } catch (err) {
    log('ERROR', 'setbannerwel: ' + err.message);
    reply('❌ Hubo un error al establecer el banner de bienvenida.');
  }
}
