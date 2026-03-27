// @nombre: sell
// @alias: sell, venderchar
// @categoria: gacha
// @descripcion: Vende un personaje de tu harem por monedas. (Uso: /sell [nombre del personaje])

import { obtenerEconomia, query } from '../../src/lib/database.js';
import { formatearNumero } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

export default async function (m, { text, sender, isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');
  if (!dbGroup.gacha_activo) return reply('❌ *Aww...* El gacha de anime está desactivado aquí. 😿');

  if (!text) {
    return reply('⚠️ *¡Ay!* Dime a quién quieres vender. `Ejemplo: /sell Rem` 🌸');
  }

  try {
    // Buscar en el harem del usuario
    const res = await query(
      `SELECT h.id as harem_id, p.nombre, p.rareza 
       FROM harem h
       JOIN personajes_disponibles p ON h.personaje_id = p.id
       WHERE h.jid_usuario = $1 AND p.nombre ILIKE $2
       LIMIT 1`,
      [sender, `%${text.trim()}%`]
    );

    if (res.rows.length === 0) {
      return reply(`❌ *Aww...* No encontré a nadie llamado "${text}" en tu harem. 😿\nAsegúrate de escribir el nombre correctamente.`);
    }

    const char = res.rows[0];
    
    // Valor de venta basado en rareza (1 = 100, 6 = 3000)
    const preciosBase = {
      1: 100,
      2: 300,
      3: 600,
      4: 1200,
      5: 2000,
      6: 4000
    };
    
    const precio = preciosBase[char.rareza] || 100;

    // Eliminar del harem y dar dinero
    await query(`DELETE FROM harem WHERE id = $1`, [char.harem_id]);
    await query(`UPDATE economia SET monedas = monedas + $1 WHERE jid = $2`, [precio, sender]);

    let txt = `╭ ꒰ 💸 𝓥𝓮𝓷𝓽𝓪 𝓭𝓮 𝓟𝓮𝓻𝓼𝓸𝓷𝓪𝓳𝓮 💸 ꒱\n`;
    txt += `┊ 👋 _Le dijiste adiós a_ *${char.nombre}*.\n`;
    txt += `┊ 💰 *Ganancia:* +${formatearNumero(precio)} ${config.economia.monedaEmoji}\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💔`;

    reply(txt);

  } catch (err) {
    console.error(err);
    reply('❌ *Oh no...* El sistema de transacciones está fallando.');
  }
}
