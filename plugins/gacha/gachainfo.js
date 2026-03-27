// @nombre: gachainfo
// @alias: gachainfo, miwaifu, infowaifu
// @categoria: gacha
// @descripcion: Muestra información de un personaje que tengas en tu harem

import { query } from '../../src/lib/database.js';

export default async function (m, { conn, text, sender, isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  if (!text) {
    return reply('⚠️ *¡Ay!* Dime de quién quieres información. `Ejemplo: /gachainfo Asuna` 🌸');
  }

  try {
    // Buscar en el harem del usuario
    // Consultamos la tabla (manejo seguro para columnas recién creadas)
    const res = await query(
      `SELECT p.*, 
       (SELECT column_name FROM information_schema.columns WHERE table_name='harem' AND column_name='imagen_personalizada') as has_cimage,
       h.id as harem_id    
       FROM harem h
       JOIN personajes_disponibles p ON h.personaje_id = p.id
       WHERE h.jid_usuario = $1 AND p.nombre ILIKE $2
       LIMIT 1`,
      [sender, `%${text.trim()}%`]
    );

    if (res.rows.length === 0) {
      return reply(`❌ *Aww...* No encontré a nadie llamado "${text}" en tu harem. 😿`);
    }

    const char = res.rows[0];
    
    // Si la columna existe, sacamos el dato real
    let customImg = null;
    if (char.has_cimage) {
      const imgRes = await query(`SELECT imagen_personalizada FROM harem WHERE id = $1`, [char.harem_id]);
      if (imgRes.rows[0]?.imagen_personalizada) {
        customImg = imgRes.rows[0].imagen_personalizada;
      }
    }

    const rarezaEstrellas = '⭐'.repeat(char.rareza);

    let caption = `╭ ꒰ 🌸 𝓘𝓷𝓯𝓸𝓻𝓶𝓪𝓬𝓲𝓸𝓷 𝓖𝓪𝓬𝓱𝓪 🌸 ꒱\n`;
    caption += `┊ 👤 *Nombre:* ${char.nombre}\n`;
    if (char.nombre_romaji) caption += `┊ 🗣️ *Original:* ${char.nombre_romaji}\n`;
    caption += `┊ 📺 *Serie:* ${char.serie || 'Desconocida'}\n`;
    caption += `┊ ✨ *Rareza:* ${rarezaEstrellas}\n`;
    if (customImg) caption += `┊ 🎨 *Imagen:* Personalizada\n`;
    caption += `╰━━━━━━━━━━━━━━━━━ 💕`;

    const imgMostrar = customImg || char.imagen_url;

    if (imgMostrar) {
      await conn.sendMessage(m.key.remoteJid, {
        image: { url: imgMostrar },
        caption: caption
      }, { quoted: m });
    } else {
      reply(caption);
    }

  } catch (err) {
    console.error(err);
    reply('❌ *Oh no...* La base de datos mágica falló.');
  }
}
