// @nombre: setbotowner
// @alias: setowner
// @categoria: subbots
// @descripcion: Cambiar el JID del dueño del sub-bot.
// @reaccion: 👑

import { query } from '../../src/lib/database.js';
import { extraerMenciones } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  const { conn, text, reply, isOwner } = ctx;

  if (!isOwner) return reply('❌ *Solo el dueño actual puede cambiar al dueño.*');

  let newOwner = null;
  const menciones = extraerMenciones(m);
  if (menciones && menciones.length > 0) {
    newOwner = menciones[0];
  } else {
    const digits = (text || '').replace(/[^\d]/g, '');
    if (digits && digits.length >= 8) {
      newOwner = `${digits}@s.whatsapp.net`;
    }
  }

  if (!newOwner || !newOwner.includes('@')) {
    return reply('❌ *Ingresa el JID o menciona al nuevo dueño.*  Ejemplo: `.setowner @123456789`');
  }

  const jid = conn.user.id.split(':')[0] + '@s.whatsapp.net';

  try {
    await query("UPDATE subbots SET jid_owner = $1 WHERE jid = $2", [newOwner, jid]);
    conn.botOwner = newOwner;
    await reply(`✅ *Dueño del bot actualizado a:* @${newOwner.split('@')[0]}`);
  } catch (e) {
    await reply(`❌ *Error:* ${e.message}`);
  }
}
