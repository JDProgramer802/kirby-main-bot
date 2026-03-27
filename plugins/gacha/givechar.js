// @nombre: givechar
// @alias: givechar, regalarwaifu, darpersonaje
// @categoria: gacha
// @descripcion: Regala un personaje de tu harem a otro usuario. (Uso: /givechar @user [nombre del personaje])

import { query } from '../../src/lib/database.js';
import { extraerMenciones, obtenerCitado } from '../../src/lib/utils.js';

export default async function (m, { text, sender, isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');
  if (!dbGroup.gacha_activo) return reply('❌ *Aww...* El gacha de anime está desactivado aquí. 😿');

  let usuarioObjetivo = extraerMenciones(m)[0];
  const citado = obtenerCitado(m);

  if (!usuarioObjetivo && citado) {
    usuarioObjetivo = citado.jid;
  }

  if (!usuarioObjetivo) {
    return reply('⚠️ *¡Ay!* Menciona al afortunado o responde a su mensajito. `Ejemplo: /givechar @user Zero Two` 🌸');
  }

  if (usuarioObjetivo === sender) {
    return reply('❌ *Eh...* No puedes regalarte personajes a ti mismo. Qué solitario~ 🥺');
  }

  const nombrePersonaje = text.replace(/@\d+/g, '').trim();

  if (!nombrePersonaje) {
    return reply('⚠️ *¡Falta algo!* Dime el nombre de la waifu o husbando que quieres regalar. 💕');
  }

  try {
    // Buscar en el harem del remitente
    const res = await query(
      `SELECT h.id as harem_id, p.id as p_id, p.nombre 
       FROM harem h
       JOIN personajes_disponibles p ON h.personaje_id = p.id
       WHERE h.jid_usuario = $1 AND p.nombre ILIKE $2
       LIMIT 1`,
      [sender, `%${nombrePersonaje}%`]
    );

    if (res.rows.length === 0) {
      return reply(`❌ *Aww...* No encontré a nadie llamado "${nombrePersonaje}" en tu harem. 😿`);
    }

    const char = res.rows[0];

    // Verificar si el destinatario ya lo tiene
    const resDestino = await query(
      `SELECT id FROM harem WHERE jid_usuario = $1 AND personaje_id = $2`,
      [usuarioObjetivo, char.p_id]
    );

    if (resDestino.rows.length > 0) {
      return reply(`⚠️ *¡Uy!* Pareces llegar tarde. @${usuarioObjetivo.split('@')[0]} ya tiene a ${char.nombre} en su harem. 💕`);
    }

    // Transferir personaje (actualizar jid_usuario)
    await query(`UPDATE harem SET jid_usuario = $1, fecha_obtencion = NOW() WHERE id = $2`, [usuarioObjetivo, char.harem_id]);

    let txt = `╭ ꒰ 🎁 𝓡𝓮𝓰𝓪𝓵𝓸 𝓚𝓪𝔀𝓪𝓲𝓲 🎁 ꒱\n`;
    txt += `┊ ✨ ¡Qué generos@ eres!\n`;
    txt += `┊ 💖 Le regalaste a *${char.nombre}* a @${usuarioObjetivo.split('@')[0]}.\n`;
    txt += `┊ 🌸 _Cuídal@ mucho~_\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);

  } catch (err) {
    console.error(err);
    reply('❌ *Oh no...* La transferencia mágica falló.');
  }
}
