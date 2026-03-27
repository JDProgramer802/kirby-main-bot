// @nombre: vote
// @alias: vote, votar, upvote
// @categoria: gacha
// @descripcion: Vota por un personaje global para subirlo en el top de popularidad. (Da 100 estrellas base)

import { query } from '../../src/lib/database.js';

export default async function (m, { text, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime por quién quieres votar. `Ejemplo: /vote Rem` 🌸');
  }

  try {
    const res = await query(
      `SELECT id, nombre, rareza FROM personajes_disponibles WHERE nombre ILIKE $1 LIMIT 1`,
      [ `%${text.trim()}%` ]
    );

    if (res.rows.length === 0) {
      return reply(`❌ *Aww...* El personaje "${text}" aún no ha sido invocado en ningún lado, no existe en la base de datos global. 😿`);
    }

    const char = res.rows[0];

    // Subimos rareza falsamente para este diseño rápido, o podríamos añadir una columna 'votos' a 'personajes_disponibles'
    await query(`ALTER TABLE personajes_disponibles ADD COLUMN IF NOT EXISTS votos INT DEFAULT 0;`);
    await query(`UPDATE personajes_disponibles SET votos = votos + 1 WHERE id = $1`, [char.id]);

    let txt = `╭ ꒰ 💖 𝓥𝓸𝓽𝓸 𝓚𝓪𝔀𝓪𝓲𝓲 💖 ꒱\n`;
    txt += `┊ ✨ ¡Gracias por tu apoyo!\n`;
    txt += `┊ 🌟 Diste +1 voto a **${char.nombre}**.\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* La urna de votos se rompió.');
  }
}
