// @nombre: serielist
// @alias: serielist, sl, mistoque
// @categoria: gacha
// @descripcion: Muestra los personajes de tu harem filtrados por nombre de la serie (Uso: /sl [serie])

import { query } from '../../src/lib/database.js';

export default async function (m, { text, sender, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime qué serie quieres buscar en tu harem. `Ejemplo: /sl Sword Art Online` 🌸');
  }

  try {
    const res = await query(
      `SELECT p.nombre, p.rareza, p.serie, h.favorito 
       FROM harem h
       JOIN personajes_disponibles p ON h.personaje_id = p.id
       WHERE h.jid_usuario = $1 AND p.serie ILIKE $2
       ORDER BY p.rareza DESC, p.nombre ASC`,
      [sender, `%${text.trim()}%`]
    );

    if (res.rows.length === 0) {
      return reply(`❌ *Aww...* No tienes a nadie de la serie "${text}" en tu harem. 😿`);
    }

    let txt = `╭ ꒰ 📺 𝓒𝓸𝓵𝓮𝓬𝓬𝓲𝓸𝓷: 𝓢𝓮𝓻𝓲𝓮 📺 ꒱\n`;
    txt += `┊ 🎞️ *Búsqueda:* ${text}\n`;
    txt += `┊ 🎴 *Encontrados:* ${res.rows.length}\n`;
    txt += `┊ \n`;
    
    // Mostrar solo los primeros 15
    const mostrar = res.rows.slice(0, 15);
    mostrar.forEach(p => {
      const fav = p.favorito ? ' (💖)' : '';
      txt += `┊ ☆ ${p.nombre} [${'⭐'.repeat(p.rareza)}]${fav}\n`;
    });

    if (res.rows.length > 15) {
      txt += `┊ \n┊ ...y ${res.rows.length - 15} más ocultos~ \n`;
    }
    
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);

  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Hubo un error al buscar en tus cintas de anime.');
  }
}
