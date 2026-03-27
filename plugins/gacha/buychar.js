// @nombre: buychar
// @alias: buychar, comprarwaifu
// @categoria: gacha
// @descripcion: Busca y compra un personaje específico de AniList. Cuesta sumas enormes.

import { buscarPersonaje } from '../../src/lib/anilist.js';
import { obtenerEconomia, query } from '../../src/lib/database.js';
import { formatearNumero } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

export default async function (m, { conn, text, sender, isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');
  if (!dbGroup.gacha_activo) return reply('❌ *Aww...* El gacha de anime está desactivado aquí. 😿');

  if (!text) {
    return reply('⚠️ *¡Ay!* Dime a quién quieres comprar. `Ejemplo: /buychar Asuna Yuuki` 🌸');
  }

  const econ = await obtenerEconomia(sender);
  const costo = config.gacha.precioBuyChar * 10; // 10 veces el precio normal (5000)

  if (Number(econ.monedas) < costo) {
    return reply(`❌ *Ay no...* Comprar un personaje a pedido cuesta ${formatearNumero(costo)} ${config.economia.monedaEmoji}.\nSolo tienes ${formatearNumero(econ.monedas)}. 😿`);
  }

  reply('☁️ ✨ _Buscando en los registros de la galaxia..._');

  try {
    const personaje = await buscarPersonaje(text);

    if (!personaje) {
      return reply(`❌ *Aww...* No pude encontrar a "${text}" en AniList. Intenta con su nombre completo en romaji o inglés.`);
    }

    // Comprobar si ya existe en la DB global para obtener ID, si no insertarlo
    await query(
      `INSERT INTO personajes_disponibles (anilist_id, nombre, serie, imagen_url, rareza) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (anilist_id) DO NOTHING`,
      [personaje.anilist_id, personaje.nombre, personaje.serie, personaje.imagen, personaje.rareza]
    );

    const res = await query(`SELECT id FROM personajes_disponibles WHERE anilist_id = $1`, [personaje.anilist_id]);
    const pId = res.rows[0].id;

    // Ver si ya lo tiene en el Harem
    const hasChar = await query(
      `SELECT id FROM harem WHERE jid_usuario = $1 AND personaje_id = $2`,
      [sender, pId]
    );

    if (hasChar.rows.length > 0) {
      return reply(`⚠️ *¡Aww!* Ya tienes a **${personaje.nombre}** en tu harem. No gastes tu dinerito tontamente. 💕`);
    }

    // Comprar
    await query(`UPDATE economia SET monedas = monedas - $1 WHERE jid = $2`, [costo, sender]);
    await query(`INSERT INTO harem (jid_usuario, personaje_id) VALUES ($1, $2)`, [sender, pId]);

    const rarezaEstrellas = '⭐'.repeat(personaje.rareza);

    let caption = `╭ ꒰ 🛍️ 𝓒𝓸𝓶𝓹𝓻𝓪 𝓔𝔁𝓲𝓽𝓸𝓼𝓪 🛍️ ꒱\n`;
    caption += `┊ 👤 *Nombre:* ${personaje.nombre}\n`;
    caption += `┊ 📺 *Serie:* ${personaje.serie}\n`;
    caption += `┊ ✨ *Rareza:* ${rarezaEstrellas}\n`;
    caption += `┊ 💰 *Costo:* -${formatearNumero(costo)} ${config.economia.monedaEmoji}\n`;
    caption += `┊ \n`;
    caption += `┊ 💖 _¡Añadido directamente a tu harem!_\n`;
    caption += `╰━━━━━━━━━━━━━━━━━ 💕`;

    // Enviar imagen
    await conn.sendMessage(m.key.remoteJid, {
      image: { url: personaje.imagen },
      caption: caption
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Ocurrió un error mágico inesperado.');
  }
}
