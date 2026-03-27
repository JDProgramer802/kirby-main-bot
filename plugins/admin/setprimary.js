// @nombre: setprimary
// @alias: setprimary, setprincipal, principal
// @categoria: admin
// @descripcion: Marca a un subbot como el bot principal del grupo. (Uso: /setprimary @bot o responde al mensaje del bot)

import { query } from '../../src/lib/database.js';
import { extraerMenciones, obtenerCitado } from '../../src/lib/utils.js';

export default async function (m, { conn, args, sender, isGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupos. 🌸');

  // Verificar si el usuario es admin del grupo
  const metadata = await conn.groupMetadata(m.key.remoteJid).catch(() => null);
  if (!metadata) return reply('❌ No se pudo obtener la información del grupo.');

  const participante = metadata.participants.find(p => p.id === sender);
  if (!participante?.admin) {
    return reply('❌ *Kyaa!* Solo los administradores pueden usar este comando. 👑');
  }

  // Obtener el JID del bot objetivo
  let objetivo = extraerMenciones(m)[0];
  const citado = obtenerCitado(m);
  if (!objetivo && citado) objetivo = citado.jid;

  if (!objetivo) {
    return reply('⚠️ *¡Ay!* Menciona o responde al mensaje del bot que quieres marcar como principal.\n`Ejemplo: /setprimary @bot` 🌸');
  }

  try {
    // Guardar el bot principal en la configuración del grupo
    await query(
      `UPDATE grupos SET imagen_grupo = $1 WHERE jid = $2`,
      [objetivo, m.key.remoteJid]
    );

    let txt = `╭ ꒰ 👑 𝓑𝓸𝓽 𝓟𝓻𝓲𝓷𝓬𝓲𝓹𝓪𝓵 𝓔𝓼𝓽𝓪𝓫𝓵𝓮𝓬𝓲𝓭𝓸 👑 ꒱\n`;
    txt += `┊ ✨ El bot principal del grupo ha sido actualizado.\n`;
    txt += `┊ 🤖 *Bot:* @${objetivo.split('@')[0]}\n`;
    txt += `┊ 💎 Este bot tendrá prioridad de respuesta.\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    await conn.sendMessage(m.key.remoteJid, {
      text: txt,
      mentions: [objetivo]
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* No se pudo actualizar el bot principal.');
  }
}
