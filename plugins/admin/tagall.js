// @nombre: tagall
// @alias: tagall, tag, todos
// @categoria: admin
// @descripcion: Etiqueta a todos los miembros del grupo.

import { obtenerCitado } from '../../src/lib/utils.js';

export default async function (m, { conn, isGroup, text, reply }) {
  if (!isGroup) return reply('_ᴇꜱᴛᴇ ᴄᴏᴍᴀɴᴅᴏ ꜱᴏʟᴏ ꜰᴜɴᴄɪᴏɴᴀ ᴇɴ ɢʀᴜᴘᴏꜱ_');

  try {
    const groupMetadata = await conn.groupMetadata(m.key.remoteJid);
    const jids = groupMetadata.participants.map(u => u.id);

    // ── Menciones 100% invisibles ─────────────────────────────
    // WhatsApp notifica a todos si están en el array 'mentions'
    // El texto solo necesita tener algo — no hace falta mostrar @usuario
    const invisible = jids.map(() => `\u200B`).join('');

    const citado = obtenerCitado(m);
    const mensaje = text
      ? `${text}${invisible}`   // texto del usuario + menciones ocultas al final
      : `\u200B${invisible}`;   // sin texto: solo caracteres invisibles

    // Reconstruimos el objeto citado para que Baileys no dé error de "fromMe"
    const mensajeCitado = citado 
      ? { key: citado.clave, message: citado.mensaje } 
      : m;

    await conn.sendMessage(m.key.remoteJid, {
      text: mensaje,
      mentions: jids            // aquí es donde WhatsApp envía la notificación real
    }, { quoted: mensajeCitado });

  } catch (err) {
    console.error(err);
    reply('_ʜᴜʙᴏ ᴜɴ ᴇʀʀᴏʀ, ɪɴᴛᴇɴᴛᴀ ᴅᴇ ɴᴜᴇᴠᴏ_');
  }
}