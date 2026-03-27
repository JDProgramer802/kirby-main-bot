// @nombre: nuke
// @alias: nuke, purge, limpiar
// @categoria: admin
// @descripcion: Elimina los últimos N mensajes del grupo (hasta un límite de 200).

import { messageCache } from '../../src/lib/handler.js';
import config from '../../src/lib/config.js';

export default async function (m, { conn, isGroup, args, reply, sender }) {
  if (!isGroup) return reply('❌ Este comando solo se puede usar en grupos.');

  // Verificar admin del usuario
  const groupMetadata = await conn.groupMetadata(m.key.remoteJid);
  const participant = groupMetadata.participants.find(p => 
    p.id === sender || p.id === m.key.participant || (sender && p.id.includes(sender.split('@')[0]))
  );
  const isSenderAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin' || m.key.fromMe || sender === config.ownerJid;

  if (!isSenderAdmin) {
    return reply('❌ Lo siento, solo los administradores pueden usar este comando.');
  }

  // Verificar admin del bot (soportando tanto @s.whatsapp.net como @lid)
  const botBaseId = (conn.user?.id || '').split(':')[0];
  const botParticipant = groupMetadata.participants.find(p => 
    p.id === botBaseId + '@s.whatsapp.net' || 
    p.id === botBaseId + '@lid' || 
    p.id === conn.user?.id || 
    p.id.includes(botBaseId)
  );
  
  const isBotAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';

  if (!isBotAdmin) {
    return reply('❌ Necesito ser administrador del grupo para poder eliminar mensajes masivos (detectado como bot no-admin).');
  }

  const num = parseInt(args[0]);
  if (!num || isNaN(num) || num < 1 || num > 200) {
    return reply(`⚠️ *Uso incorrecto.*\n📌 *Ejemplo:* ${config.prefijo}nuke 20\n(Para eliminar 20 mensajes. El límite actual de memoria del bot es de 200 mensajes)`);
  }

  const jid = m.key.remoteJid;
  if (!messageCache.has(jid) || messageCache.get(jid).length === 0) {
    return reply('❌ No tengo mensajes recientes guardados en memoria para este chat. (Solo puedo borrar mensajes enviados desde que el bot se reinició)');
  }

  const cachedKeys = messageCache.get(jid);
  // Eliminamos N mensajes solicitados + 1 (el propio mensaje de nuke)
  const amountToDelete = num + 1;
  const keysToDelete = cachedKeys.slice(-amountToDelete); 
  
  let deletedCount = 0;
  for (const key of keysToDelete) {
    try {
      await conn.sendMessage(jid, { delete: key });
      deletedCount++;
    } catch (e) {
      // Ignorar errores (ej: un mensaje ya fue eliminado)
    }
  }

  const realCount = deletedCount > 0 ? deletedCount - 1 : 0; // Descontamos el comando /nuke

  // Eliminar referencias de la caché
  const keysIdsDeleted = keysToDelete.map(k => k.id);
  const remainingKeys = cachedKeys.filter(k => !keysIdsDeleted.includes(k.id));
  messageCache.set(jid, remainingKeys);

  // Mensaje de confirmación auto-destruible
  const confirmMsg = await conn.sendMessage(jid, { text: `✅ ¡Nuke completado! Se han borrado *${realCount}* mensajes.` });
  
  setTimeout(async () => {
    try {
      if (confirmMsg && confirmMsg.key) {
        await conn.sendMessage(jid, { delete: confirmMsg.key });
      }
    } catch (e) {}
  }, 5000); // 5 segundos después
}
