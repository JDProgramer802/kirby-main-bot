// @nombre: setusername
// @alias: setnick
// @categoria: subbots
// @descripcion: Cambiar el nombre de usuario del bot (interno).
// @reaccion: 👤

import { query } from '../../src/lib/database.js';

export default async function(m, ctx) {
  const { conn, text, reply } = ctx;
  
  if (!text) return reply('❌ *Por favor ingresa el nuevo nombre de usuario.*');
  
  const jid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  
  try {
    await query("UPDATE subbots SET nombre = $1 WHERE jid = $2", [text, jid]);
    await reply(`✅ *Nombre de usuario interno actualizado a:* ${text}`);
  } catch (e) {
    await reply(`❌ *Error:* ${e.message}`);
  }
}
