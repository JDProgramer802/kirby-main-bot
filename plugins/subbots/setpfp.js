// @nombre: setpfp
// @alias: setimage
// @categoria: subbots
// @descripcion: Cambiar la foto de perfil del bot.
// @reaccion: 🖼️

export default async function(m, ctx) {
  const { conn, reply } = ctx;
  
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  
  if (!/image/.test(mime)) return reply('❌ *Por favor responde a una imagen.*');
  
  try {
    const media = await q.download();
    await conn.updateProfilePicture(conn.user.id, media);
    await reply('✅ *Foto de perfil actualizada correctamente.*');
  } catch (e) {
    await reply(`❌ *Error:* ${e.message}`);
  }
}
