// @nombre: profile
// @alias: profile, perfil
// @categoria: perfiles
// @descripcion: Muestra tu perfil o el de otro usuario. (Uso: /profile [@user])

import { query, obtenerUsuario } from '../../src/lib/database.js';
import { extraerMenciones, obtenerCitado } from '../../src/lib/utils.js';

export default async function (m, { conn, args, sender, isGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  let objetivo = extraerMenciones(m)[0];
  const citado = obtenerCitado(m);
  
  if (!objetivo && citado) objetivo = citado.jid;
  if (!objetivo) objetivo = sender; // Default a uno mismo

  try {
    const userResult = await query(`SELECT * FROM usuarios WHERE jid = $1`, [objetivo]);
    let user = userResult.rows[0];

    if (!user) {
      user = await obtenerUsuario(objetivo);
    }

    let parejaTexto = 'Nadie 💔';
    if (user.pareja) {
      const dbPareja = await query(`SELECT nombre FROM usuarios WHERE jid = $1`, [user.pareja]);
      const nPareja = dbPareja.rows[0]?.nombre || `@${user.pareja.split('@')[0]}`;
      parejaTexto = nPareja + ' 💍';
    }

    // Sacar URL de perfil y construir el mensaje
    let ppUrl = null;
    try {
      ppUrl = await conn.profilePictureUrl(objetivo, 'image');
    } catch (e) {
      console.log('No se pudo obtener la foto de perfil, se enviará solo texto.');
    }

    let txt = `╭ ꒰ 🌸 𝓟𝓮𝓻𝓯𝓲𝓵 𝓭𝓮 𝓤𝓼𝓾𝓪𝓻𝓲𝓸 🌸 ꒱\n`;
    txt += `┊ 👤 *Usuario:* @${objetivo.split('@')[0]}\n`;
    txt += `┊ 📖 *Bio:* ${user.descripcion || 'Sin descripción'}\n`;
    txt += `┊ ⚧️ *Género:* ${user.genero || 'No especificado'}\n`;
    txt += `┊ 🎂 *Cumple:* ${user.cumpleanos || 'Misterio'}\n`;
    txt += `┊ 💕 *Pareja:* ${parejaTexto}\n`;
    txt += `┊ \n`;
    txt += `┊ 🌟 *Nivel:* ${user.nivel} (${user.xp} XP)\n`;
    txt += `┊ 💬 *Mensajes:* ${user.mensajes} enviados\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    const messageOptions = {
      text: txt,
      mentions: [objetivo]
    };

    if (ppUrl) {
      messageOptions.image = { url: ppUrl };
      messageOptions.caption = txt;
      delete messageOptions.text; // No enviar 'text' si ya hay 'caption'
    }

    await conn.sendMessage(m.key.remoteJid, messageOptions, { quoted: m });

  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El espionaje mágico falló.');
  }
}
