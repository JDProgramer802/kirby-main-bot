// @nombre: setname
// @alias: setbotname
// @categoria: subbots
// @descripcion: Cambiar el nombre del bot.
// @reaccion: 📛

import config from '../../src/lib/config.js';
import { query } from '../../src/lib/database.js';

export default async function(m, ctx) {
  const { conn, text, reply, isOwner } = ctx;

  // Determinar si tiene permiso (dueño principal o el propio bot)
  const myJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  const isBotOwner = m.sender === myJid || m.sender === (conn.botOwner || config.ownerJid) || isOwner;

  if (!isBotOwner) return reply('❌ *¡Oops!* Solo el dueño puede cambiar mi nombre. 🌸');
  if (!text) return reply('❌ *Por favor ingresa el nuevo nombre.*');

  try {
    // 1. Cambiar nombre en el perfil de WhatsApp
    await conn.updateProfileName(text);

    // 2. Si es subbot, actualizar en la base de datos para que persista
    if (conn.isSubbot) {
      await query("UPDATE subbots SET nombre = $1 WHERE jid = $2", [text, myJid]);
    }

    await reply(`✅ *¡Qué chimba!* Mi nombre ha sido cambiado a:\n✨ *${text}* ✨`);
  } catch (e) {
    await reply(`❌ *Error:* ${e.message}`);
  }
}
