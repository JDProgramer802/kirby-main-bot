// @nombre: setstatus
// @alias: setbotstatus
// @categoria: subbots
// @descripcion: Cambiar el estado (info) del bot en WhatsApp.
// @reaccion: 📝

export default async function(m, ctx) {
  const { conn, text, reply } = ctx;
  
  if (!text) return reply('❌ *Por favor ingresa el nuevo estado.*');
  
  try {
    await conn.updateProfileStatus(text);
    await reply(`✅ *Estado actualizado a:* ${text}`);
  } catch (e) {
    await reply(`❌ *Error:* ${e.message}`);
  }
}
