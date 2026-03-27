// @nombre: join
// @alias: entrar
// @categoria: subbots
// @descripcion: Unir al bot a un grupo mediante enlace.
// @reaccion: 🚪

export default async function(m, ctx) {
  const { conn, args, reply } = ctx;
  
  if (!args[0]) return reply('❌ *Por favor ingresa un enlace de invitación.*');
  
  const code = args[0].split('chat.whatsapp.com/')[1];
  if (!code) return reply('❌ *Enlace de invitación inválido.*');
  
  try {
    const res = await conn.groupAcceptInvite(code);
    await reply('✅ *Me he unido al grupo exitosamente.*');
  } catch (e) {
    await reply(`❌ *Error al unirme:* ${e.message}`);
  }
}
