// @nombre: deposit
// @alias: deposit, dep, depositar, d
// @categoria: economia
// @descripcion: Deposita monedas de tu bolsillo a tu banco seguro

import { obtenerEconomia, query } from '../../src/lib/database.js';
import config from '../../src/lib/config.js';
import { formatearNumero } from '../../src/lib/utils.js';

export default async function (m, { args, sender, reply }) {
  const econ = await obtenerEconomia(sender);
  
  if (!args[0]) {
    return reply('⚠️ *Oopsie!* Dime cuánto quieres guardar. Ejemplo: `/dep 100` o `/dep all` 🌸');
  }

  let cantidad = 0;
  if (args[0].toLowerCase() === 'all' || args[0].toLowerCase() === 'todo') {
    cantidad = Number(econ.monedas);
  } else {
    cantidad = parseInt(args[0]);
  }

  if (isNaN(cantidad) || cantidad <= 0) {
    return reply('❌ *¡Cuidado!* Ingresa un número válido para depositar. 🥺');
  }

  if (Number(econ.monedas) < cantidad) {
    return reply(`❌ *Aww...* No tienes tantas monedas en el bolsillo.\nSolo tienes ${formatearNumero(econ.monedas)} ${config.economia.monedaEmoji}. 😿`);
  }

  try {
    // Restar del bolsillo y sumar al banco
    await query(`UPDATE economia SET monedas = monedas - $1, banco = banco + $1 WHERE jid = $2`, [cantidad, sender]);

    let txt = `╭ ꒰ 🏦 𝓓𝓮𝓹𝓸𝓼𝓲𝓽𝓸 𝓔𝔁𝓲𝓽𝓸𝓼𝓸 🏦 ꒱\n`;
    txt += `┊ ✨ Guardaste tu dinerito seguro en el banco.\n`;
    txt += `┊ 💰 *Depositado:* ${formatearNumero(cantidad)} ${config.economia.monedaEmoji}\n`;
    txt += `┊ 👛 *Bolsillo actual:* ${formatearNumero(Number(econ.monedas) - cantidad)}\n`;
    txt += `┊ 🏦 *Banco actual:* ${formatearNumero(Number(econ.banco) + cantidad)}\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 🔒`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Oh no...* El banquito está cerrado, intenta más tarde. 🥺');
  }
}
