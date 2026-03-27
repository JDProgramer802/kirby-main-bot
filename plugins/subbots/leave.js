// @nombre: leave
// @alias: salir
// @categoria: subbots
// @descripcion: Salir del grupo actual.
// @reaccion: 👋

export default async function(m, ctx) {
  const { conn, isGroup, reply } = ctx;
  
  if (!isGroup) return reply('❌ *Este comando solo funciona en grupos.*');
  
  await reply('👋 *¡Adiós a todos! Ha sido un placer.*');
  await conn.groupLeave(m.key.remoteJid);
}
