// @nombre: withdraw
// @alias: withdraw, retirar, w, ret
// @categoria: economia
// @descripcion: Retira monedas de tu banco al bolsillo. (Uso: /withdraw 100 o /withdraw all)

import { obtenerEconomia, query } from '../../src/lib/database.js';
import config from '../../src/lib/config.js';
import { formatearNumero } from '../../src/lib/utils.js';

export default async function (m, { args, sender, reply }) {
  const econ = await obtenerEconomia(sender);

  if (!args[0]) {
    return reply('⚠️ *Oopsie!* Dime cuánto quieres retirar. Ejemplo: `/withdraw 100` o `/withdraw all` 🌸');
  }

  let cantidad = 0;
  if (args[0].toLowerCase() === 'all' || args[0].toLowerCase() === 'todo') {
    cantidad = Number(econ.banco);
  } else {
    cantidad = parseInt(args[0]);
  }

  if (isNaN(cantidad) || cantidad <= 0) {
    return reply('❌ *¡Cuidado!* Ingresa un número válido para retirar. 🥺');
  }

  if (Number(econ.banco) < cantidad) {
    return reply(`❌ *Aww...* No tienes tanto en el banco.\nSolo tienes ${formatearNumero(econ.banco)} ${config.economia.monedaEmoji} guardado. 😿`);
  }

  try {
    await query(
      `UPDATE economia SET banco = banco - $1, monedas = monedas + $1 WHERE jid = $2`,
      [cantidad, sender]
    );

    let txt = `╭ ꒰ 🏦 𝓡𝓮𝓽𝓲𝓻𝓸 𝓔𝔁𝓲𝓽𝓸𝓼𝓸 🏦 ꒱\n`;
    txt += `┊ 💸 Sacaste tu dinerito del banco.\n`;
    txt += `┊ 💰 *Retirado:* ${formatearNumero(cantidad)} ${config.economia.monedaEmoji}\n`;
    txt += `┊ 👛 *Bolsillo actual:* ${formatearNumero(Number(econ.monedas) + cantidad)}\n`;
    txt += `┊ 🏦 *Banco actual:* ${formatearNumero(Number(econ.banco) - cantidad)}\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Oh no...* El banco explotó, intenta más tarde. 🥺');
  }
}
