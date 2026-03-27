// @nombre: kick
// @alias: kick, ban, echar
// @categoria: admin
// @descripcion: Expulsa a un usuario del grupo mencionándolo o respondiendo a su mensaje
// @reaccion: 🔪

import { extraerMenciones, obtenerCitado } from '../../src/lib/utils.js';

export default async function (m, { conn, isGroup, reply, sender, react }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  try {
    const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const metadata = await conn.groupMetadata(m.key.remoteJid);
    const botParticipant = metadata.participants.find(p => p.id === botJid);
    
    if (!botParticipant?.admin) {
      return reply('❌ *Aww...* Necesito ser Administrador para poder expulsar amiguitos. 🥺');
    }

    let usuariosAExpulsar = extraerMenciones(m);
    
    if (usuariosAExpulsar.length === 0) {
      const citado = obtenerCitado(m);
      if (citado) {
        usuariosAExpulsar.push(citado.jid);
      }
    }

    if (usuariosAExpulsar.length === 0) {
      return reply('⚠️ *¡Eh!* Menciona a alguien o responde a su mensajito con /kick ~ 🔪');
    }

    if (usuariosAExpulsar.includes(botJid)) {
      return reply('❌ *¡Ahhh!* No puedes expulsarme a mí. Yo soy un botcito bueno. 😭');
    }

    if (usuariosAExpulsar.includes(sender)) {
      return reply('❌ *Eh...* ¿Seguro que quieres auto-expulsarte? Mejor no lo hago por ti. 🥺');
    }

    // Ejecutar expulsión
    await conn.groupParticipantsUpdate(
      m.key.remoteJid, 
      usuariosAExpulsar,
      'remove'
    );

    // No enviamos mensaje de texto, solo reaccionamos al comando (se hace automáticamente en index.js)
    // Pero podemos forzar una reacción de éxito aquí si queremos algo diferente
    await react('✅');

  } catch (error) {
    // Si da error (ej. es el creador del grupo, ya no está, etc), mostramos mensaje amigable pero no llenamos la consola de errores crudos
    await react('❌').catch(() => {});
    reply('❌ *Ay...* Hubo un problemita expulsando a este usuario. A lo mejor es el creador del grupo. 😿').catch(() => {});
  }
}
