// @nombre: coinflip
// @alias: coinflip, flip, cf, apostar
// @categoria: economia
// @descripcion: Juega cara o cruz y apuesta tus monedas. (Uso: /cf [cara/cruz] [cantidad])

import config from '../../src/lib/config.js';
import { obtenerEconomia } from '../../src/lib/database.js';
import { formatearNumero } from '../../src/lib/utils.js';

export default async function (m, { args, sender, isGroup, dbGroup, reply }) {
  if (isGroup && !dbGroup.economia_activa) {
    return reply('❌ *Oopsie~* La economía está desactivada en este grupito. 💸');
  }

  if (args.length < 2) {
    return reply('⚠️ *¡Ay!* Dime a qué le vas y cuánto. `Ejemplo: /cf cara 100` o `/cf cruz all` 🌸');
  }

  const eleccion = args[0].toLowerCase();
  if (eleccion !== 'cara' && eleccion !== 'cruz') {
    return reply('❌ *Aww...* Solo puedes elegir entre `cara` o `cruz`. 🪙');
  }

  const econ = await obtenerEconomia(sender);

  let apuesta = 0;
  if (args[1].toLowerCase() === 'all' || args[1].toLowerCase() === 'todo') {
    apuesta = Number(econ.monedas) + Number(econ.banco);
  } else {
    apuesta = parseInt(args[1]);
  }

  if (isNaN(apuesta) || apuesta <= 0) {
    return reply('❌ *¡Cuidado!* Ingresa un número válido para apostar. 🥺');
  }

  // Lógica del flip (50% aprox)
  const moneda = Math.random() < 0.5 ? 'cara' : 'cruz';
  const gano = eleccion === moneda;

  try {
    if (gano) {
      // Gana la apuesta
      await actualizarMonedas(sender, apuesta);

      let txt = `╭ ꒰ 🪙 𝓒𝓸𝓲𝓷𝓯𝓵𝓲𝓹 𝓚𝓪𝔀𝓪𝓲𝓲 🪙 ꒱\n`;
      txt += `┊ ✨ Cayó: *${moneda.toUpperCase()}*\n`;
      txt += `┊ 🎉 _¡Felicidades estrellita! Ganaste la apuesta._\n`;
      txt += `┊ 💰 *Premio:* +${formatearNumero(apuesta)} ${config.economia.monedaEmoji}\n`;
      txt += `╰━━━━━━━━━━━━━━━━━ 💕`;
      reply(txt);
    } else {
      // Pierde la apuesta (usando el cobro inteligente)
      await descontarMonedas(sender, apuesta);

      let txt = `╭ ꒰ 🪙 𝓒𝓸𝓲𝓷𝓯𝓵𝓲𝓹 𝓚𝓪𝔀𝓪𝓲𝓲 🪙 ꒱\n`;
      txt += `┊ ☁️ Cayó: *${moneda.toUpperCase()}*\n`;
      txt += `┊ 💔 _¡Aww, qué pena! Perdiste la apuesta._\n`;
      txt += `┊ 💸 *Pérdida:* -${formatearNumero(apuesta)} ${config.economia.monedaEmoji}\n`;
      txt += `╰━━━━━━━━━━━━━━━━━ 🌧️`;
      reply(txt);
    }
  } catch (err) {
    // El error de descontarMonedas ya es descriptivo
    reply(`❌ *Oh no...* ${err.message}`);
  }
}
