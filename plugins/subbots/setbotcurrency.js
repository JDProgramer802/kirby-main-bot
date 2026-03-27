// @nombre: setbotcurrency
// @alias: setmoneda
// @categoria: subbots
// @descripcion: Cambiar el nombre de la moneda del bot.
// @reaccion: 💰

import { query } from '../../src/lib/database.js';

export default async function(m, ctx) {
  const { conn, text, reply } = ctx;
  
  if (!text) return reply('❌ *Ingresa el nombre de la nueva moneda.*');
  
  const jid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  
  try {
    await query("UPDATE subbots SET moneda = $1 WHERE jid = $2", [text, jid]);
    await reply(`✅ *Moneda actualizada a:* ${text}`);
  } catch (e) {
    await reply(`❌ *Error:* ${e.message}`);
  }
}
