// @nombre: close
// @alias: close, cerrar
// @categoria: admin
// @descripcion: Cierra el grupo para que solo los administradores puedan enviar mensajes
// @reaccion: 🔒

export default async function (m, { conn, isGroup, reply, react }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  try {
    const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const metadata = await conn.groupMetadata(m.key.remoteJid);
    const botParticipant = metadata.participants.find(p => p.id === botJid);
    
    if (!botParticipant?.admin) {
      return reply('❌ *Aww...* Necesito ser Administrador para poder cerrar el grupo. 🥺');
    }

    await conn.groupSettingUpdate(m.key.remoteJid, 'announcement');
    
    // No enviamos mensaje de texto, solo reaccionamos al comando
    await react('✅');

  } catch (err) {
    console.error(err);
    await react('❌');
    reply('❌ *Aww...* Hubo un error al intentar cerrar el grupo.');
  }
}
