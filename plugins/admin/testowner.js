// @nombre: testowner
// @alias: testdueño, whoami, soyowner
// @categoria: admin
// @descripcion: Verifica si el sistema te detecta como dueño correctamente.
// @reaccion: 🔍

export default async function (m, { conn, reply, isOwner, sender, isGroup }) {
  try {
    const senderNumber = sender.includes('@s.whatsapp.net') ? sender.split('@')[0] : sender;
    const esLid = sender.endsWith('@lid');
    
    let info = `🔍 *TEST DE DETECCIÓN DE DUEÑO* 🔍\n\n`;
    info += `📱 *Tu número:* ${senderNumber}\n`;
    info += `🆔 *Tipo:* ${esLid ? 'LID' : 'Número normal'}\n`;
    info += `📩 *Sender completo:* ${sender}\n`;
    info += `👑 *¿Eres dueño?* ${isOwner ? '✅ SÍ' : '❌ NO'}\n\n`;
    
    info += `🤖 *Info del bot:* ${conn.user.name || 'Kirby Bot'}\n`;
    info += `🆔 *JID del bot:* ${conn.user.id}\n`;
    info += `📱 *Número del bot:* ${conn.user.id.split(':')[0]}\n`;
    info += `🌐 *¿Es subbot?* ${conn.isSubbot ? '✅ SÍ' : '❌ NO'}\n\n`;
    
    if (conn.isSubbot) {
      info += `👤 *Dueño del subbot:* ${conn.botOwner || 'No configurado'}\n`;
    }
    
    info += `⚙️ *Dueño global configurado:* ${conn.botOwner || 'No configurado'}\n`;
    
    if (isGroup) {
      info += `\n👥 *Estás en un grupo:* ${m.key.remoteJid}\n`;
      const metadata = await conn.groupMetadata(m.key.remoteJid).catch(() => null);
      if (metadata) {
        const participant = metadata.participants.find(p => p.id === sender);
        info += `🛡️ *Tu rol:* ${participant?.admin ? 'Administrador' : 'Miembro'}\n`;
      }
    }
    
    await reply(info);
    
  } catch (error) {
    console.error('Error en testowner:', error);
    await reply('❌ Error al ejecutar el test de dueño.');
  }
}
