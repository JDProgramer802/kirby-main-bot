// @nombre: me
// @alias: me, miperfil, yo
// @categoria: perfiles
// @descripcion: Muestra tu perfil de usuario completo. (Uso: /me)

import { query, obtenerUsuario } from '../../src/lib/database.js';

export default async function (m, { conn, sender, isGroup, reply }) {
  try {
    const userResult = await query(`SELECT * FROM usuarios WHERE jid = $1`, [sender]);
    let user = userResult.rows[0];

    if (!user) {
      user = await obtenerUsuario(sender);
    }

    const econResult = await query(`SELECT monedas, banco FROM economia WHERE jid = $1`, [sender]);
    const econ = econResult.rows[0] || { monedas: 0, banco: 0 };

    // Si tiene pareja, sacar su apodo/jid
    let parejaTexto = 'Nadie 💔';
    if (user.pareja) {
      const dbPareja = await query(`SELECT nombre FROM usuarios WHERE jid = $1`, [user.pareja]);
      const nPareja = dbPareja.rows[0]?.nombre || `@${user.pareja.split('@')[0]}`;
      parejaTexto = nPareja + ' 💍';
    }

    // Sacar URL de perfil
    let ppUrl = 'https://i.ibb.co/30hS11f/kirby-default.jpg'; // Imagen default si no tiene
    try {
      ppUrl = await conn.profilePictureUrl(sender, 'image');
    } catch (e) { }

    let txt = `╭ ꒰ 🌸 𝓜𝓲 𝓟𝓮𝓻𝓯𝓲𝓵 🌸 ꒱\n`;
    txt += `┊ 👤 *Usuario:* @${sender.split('@')[0]}\n`;
    txt += `┊ 📖 *Bio:* ${user.descripcion || 'Sin descripción'}\n`;
    txt += `┊ ⚧️ *Género:* ${user.genero || 'No especificado'}\n`;
    txt += `┊ 🎂 *Cumple:* ${user.cumpleanos || 'Misterio'}\n`;
    txt += `┊ 💕 *Pareja:* ${parejaTexto}\n`;
    txt += `┊ \n`;
    txt += `┊ 🌟 *Nivel:* ${user.nivel} (${user.xp} XP)\n`;
    txt += `┊ 💬 *Mensajes:* ${user.mensajes} enviados\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    await conn.sendMessage(m.key.remoteJid, {
      image: { url: ppUrl },
      caption: txt,
      mentions: [sender]
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El espejo mágico está sucio hoy.');
  }
}
