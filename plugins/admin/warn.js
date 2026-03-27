// @nombre: warn
// @alias: warn, advertir, advertencia
// @categoria: admin
// @descripcion: Advierte a un usuario. Si alcanza el límite, es expulsado.

import { extraerMenciones, obtenerCitado } from '../../src/lib/utils.js';
import { query } from '../../src/lib/database.js';

export default async function (m, { conn, isGroup, dbGroup, text, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  const metadata = await conn.groupMetadata(m.key.remoteJid);
  const botParticipant = metadata.participants.find(p => p.id === botJid);
  
  if (!botParticipant?.admin) {
    return reply('❌ *Aww...* Necesito ser Administrador para dar advertencias serias. 🥺');
  }

  let usuarioObjetivo = extraerMenciones(m)[0];
  const citado = obtenerCitado(m);

  if (!usuarioObjetivo && citado) {
    usuarioObjetivo = citado.jid;
  }

  if (!usuarioObjetivo) {
    return reply('⚠️ *¡Eh!* Menciona a alguien o responde a su mensajito diciendo /warn [razon] ~ 🔪');
  }

  if (usuarioObjetivo === botJid) {
    return reply('❌ *¡Ahhh!* No puedes advertirme a mí. Yo soy un botcito bueno. 😭');
  }

  let razon = text.replace(/@\d+/g, '').trim() || 'Comportamiento de chico malo ~';
  if (citado && !text) {
    razon = 'Falta a las reglas en el mensajito citado';
  }

  try {
    await query(
      `INSERT INTO advertencias (jid_grupo, jid_usuario, razon) VALUES ($1, $2, $3)`,
      [m.key.remoteJid, usuarioObjetivo, razon]
    );

    const res = await query(
      `SELECT COUNT(*) as total FROM advertencias WHERE jid_grupo = $1 AND jid_usuario = $2`,
      [m.key.remoteJid, usuarioObjetivo]
    );
    const conteo = parseInt(res.rows[0].total);
    const limite = dbGroup.limite_warns || 3;

    let mensaje = `╭ ꒰ 🚨 𝓐𝓭𝓿𝓮𝓻𝓽𝓮𝓷𝓬𝓲𝓪 🚨 ꒱\n`;
    mensaje += `┊ 👤 *Usuario:* @${usuarioObjetivo.split('@')[0]}\n`;
    mensaje += `┊ 📝 *Razón:* _${razon}_\n`;
    mensaje += `┊ 🍡 *Acumuladas:* [ ${conteo} / ${limite} ]\n`;

    if (conteo >= limite) {
      mensaje += `┊ \n`;
      mensaje += `┊ ⚠️ _*¡LÍMITE ALCANZADO!* Bai bai amiguito..._ 🔪\n`;
      mensaje += `╰━━━━━━━━━━━━━━━━━ 💔`;
      
      await conn.groupParticipantsUpdate(m.key.remoteJid, [usuarioObjetivo], 'remove');
      await query(`DELETE FROM advertencias WHERE jid_grupo = $1 AND jid_usuario = $2`, [m.key.remoteJid, usuarioObjetivo]);
    } else {
      mensaje += `╰━━━━━━━━━━━━━━━━━ ⚠️`;
    }

    await conn.sendMessage(m.key.remoteJid, {
      text: mensaje,
      mentions: [usuarioObjetivo]
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    reply('❌ *Ay...* Hubo un problemita registrando la advertencia. 😿');
  }
}
