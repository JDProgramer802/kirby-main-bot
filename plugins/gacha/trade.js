// @nombre: trade
// @alias: trade, intercambiar
// @categoria: gacha
// @descripcion: Intercambia un personaje tuyo con el de otro usuario. Usa comillas inglesas para los nombres. (Uso: /trade @user "Mi Waifu" "Su Waifu")

import { query } from '../../src/lib/database.js';
import { extraerMenciones } from '../../src/lib/utils.js';

export default async function (m, { text, sender, isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');
  if (!dbGroup.gacha_activo) return reply('❌ *Aww...* El gacha está desactivado aquí. 😿');

  const usuarioObjetivo = extraerMenciones(m)[0];
  if (!usuarioObjetivo) {
    return reply('⚠️ *¡Ay!* Menciona con quién quieres hacer el intercambio.\n`Ejemplo: /trade @user "Asuna" "Rem"` 🌸');
  }

  // Parsear texto para sacar los dos nombres encerrados entre comillas
  const regex = /"([^"]+)"/g;
  const matches = [...text.matchAll(regex)].map(m => m[1]);

  if (matches.length < 2) {
    return reply('❌ *Uh oh...* Debes usar comillas para los nombres.\n`Ejemplo: /trade @user "Mi Waifu" "Su Waifu"` 🥺');
  }

  const miWaifuNombre = matches[0];
  const suWaifuNombre = matches[1];

  try {
    // Buscar mi personaje
    const miRes = await query(
      `SELECT h.id as harem_id, p.nombre 
       FROM harem h JOIN personajes_disponibles p ON h.personaje_id = p.id
       WHERE h.jid_usuario = $1 AND p.nombre ILIKE $2 LIMIT 1`,
      [sender, `%${miWaifuNombre}%`]
    );
    if (miRes.rows.length === 0) return reply(`❌ *Aww...* No tienes a "${miWaifuNombre}" en tu harem. 😿`);

    // Buscar su personaje
    const suRes = await query(
      `SELECT h.id as harem_id, p.nombre 
       FROM harem h JOIN personajes_disponibles p ON h.personaje_id = p.id
       WHERE h.jid_usuario = $1 AND p.nombre ILIKE $2 LIMIT 1`,
      [usuarioObjetivo, `%${suWaifuNombre}%`]
    );
    if (suRes.rows.length === 0) return reply(`❌ *Uy...* @${usuarioObjetivo.split('@')[0]} no tiene a "${suWaifuNombre}" en su harem. 😿`);

    const miHaremId = miRes.rows[0].harem_id;
    const suHaremId = suRes.rows[0].harem_id;

    // Hacer el trueque directo (un trade real requeriría confirmación, 
    // pero para este bot base forzamos la transferencia si ambos existen para simplificar).
    await query(`UPDATE harem SET jid_usuario = $1 WHERE id = $2`, [usuarioObjetivo, miHaremId]);
    await query(`UPDATE harem SET jid_usuario = $1 WHERE id = $2`, [sender, suHaremId]);

    let txt = `╭ ꒰ 🤝 𝓘𝓷𝓽𝓮𝓻𝓬𝓪𝓶𝓫𝓲𝓸 𝓔𝔁𝓲𝓽𝓸𝓼𝓸 🤝 ꒱\n`;
    txt += `┊ ✨ ¡Trato cerrado!\n`;
    txt += `┊ 💖 Diste a **${miRes.rows[0].nombre}**.\n`;
    txt += `┊ 💖 Recibiste a **${suRes.rows[0].nombre}**.\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    // Etiquetamos a ambos
    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El contrato mágico falló y los personajes no se movieron.');
  }
}
