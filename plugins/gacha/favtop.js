// @nombre: favtop
// @alias: favtop, topfavoritos
// @categoria: gacha
// @descripcion: Muestra cuáles son los personajes más de AniList que tienes en tu harem. Pone como favoritos a los que elijas. (Uso: /favtop [nombre])

import { query } from '../../src/lib/database.js';

export default async function (m, { text, sender, isGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  try {
    if (!text) {
      // Mostrar lista de favoritos
      const res = await query(
        `SELECT p.nombre, p.rareza
         FROM harem h
         JOIN personajes_disponibles p ON h.personaje_id = p.id
         WHERE h.jid_usuario = $1 AND h.favorito = true
         ORDER BY p.rareza DESC`,
        [sender]
      );

      if (res.rows.length === 0) {
        return reply('⚠️ *Aww...* Todavía no tienes a nadie marcadito como favorito. Usa `/favtop [nombre]` para elegir a tu amorcito. 💕');
      }

      let txt = `╭ ꒰ 💖 𝓣𝓾𝓼 𝓕𝓪𝓿𝓸𝓻𝓲𝓽𝓸𝓼 💖 ꒱\n`;
      res.rows.forEach(p => {
        txt += `┊ 🌟 ${p.nombre} [${'⭐'.repeat(p.rareza)}]\n`;
      });
      txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

      return reply(txt);
    }

    // Marcar/Desmarcar como favorito
    const res = await query(
      `SELECT h.id as harem_id, h.favorito, p.nombre 
       FROM harem h
       JOIN personajes_disponibles p ON h.personaje_id = p.id
       WHERE h.jid_usuario = $1 AND p.nombre ILIKE $2
       LIMIT 1`,
      [sender, `%${text.trim()}%`]
    );

    if (res.rows.length === 0) {
      return reply(`❌ *Uy...* No encontré a "${text}" en tu harem. 😿`);
    }

    const el = res.rows[0];
    const nuevoEstado = !el.favorito;

    await query(`UPDATE harem SET favorito = $1 WHERE id = $2`, [nuevoEstado, el.harem_id]);

    if (nuevoEstado) {
      reply(`✅ *¡Aww!* Ahora **${el.nombre}** está en tus favoritos con una cintita rosada. 🎀`);
    } else {
      reply(`✨ *Mmm...* **${el.nombre}** ya no es tu favorito. 💔`);
    }

  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Ocurrió un error en tus registros de amor.');
  }
}
