// @nombre: loteria
// @alias: loteria, lottery, raspa
// @categoria: economia
// @descripcion: Compra un boleto de lotería y raspa para ver si ganas el premio mayor

import { obtenerEconomia, actualizarMonedas, query } from '../../src/lib/database.js';
import { cooldownRestante, formatearTiempo, formatearNumero } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

export default async function (m, { sender, reply }) {
  const econ = await obtenerEconomia(sender);
  
  const COOLDOWN_LOTERIA = 60 * 60 * 1000; // 1 hora
  const restantes = cooldownRestante(econ.ultimo_loteria, COOLDOWN_LOTERIA);
  if (restantes > 0) {
    return reply(`❌ *¡Tranquilo, ludópata!*\n⏳ Los boletos se agotaron. Vuelve por más en: *${formatearTiempo(restantes)}* 🎫`);
  }

  const precioBoleto = 1000;
  if (econ.monedas < precioBoleto) {
    return reply(`❌ Cuesta ${formatearNumero(precioBoleto)} monedas comprar un boleto. ¡No tienes suficiente!`);
  }

  // Cobrar boleto
  await actualizarMonedas(sender, -precioBoleto);
  await query(`UPDATE economia SET ultimo_loteria = NOW(), total_perdido = total_perdido + $1 WHERE jid = $2`, [precioBoleto, sender]);

  // Probabilidades
  const rng = Math.random() * 100;

  let txt = `╭ ꒰ 🎫 𝓡𝓪𝓼𝓹𝓪 𝔂 𝓖𝓪𝓷𝓪 🎫 ꒱\n`;
  txt += `┊ 🪙 Raspando el boleto...\n`;
  txt += `┊ ───────────────\n`;

  if (rng <= 1) { // 1% jackpot
    const premio = 50000;
    await actualizarMonedas(sender, premio);
    await query(`UPDATE economia SET total_ganado = total_ganado + $1 WHERE jid = $2`, [premio, sender]);
    txt += `┊ 🎰 ¡¡¡JACKPOT!!! 🎰\n`;
    txt += `┊ 🎉 Tienes la suerte de los dioses.\n`;
    txt += `┊ 💰 *Ganaste:* +${formatearNumero(premio)} ${config.economia.monedaEmoji}\n`;
  } else if (rng <= 6) { // 5% grande
    const premio = 10000;
    await actualizarMonedas(sender, premio);
    await query(`UPDATE economia SET total_ganado = total_ganado + $1 WHERE jid = $2`, [premio, sender]);
    txt += `┊ ✨ ¡Felicidades! Un premio muy gordo.\n`;
    txt += `┊ 💰 *Ganaste:* +${formatearNumero(premio)} ${config.economia.monedaEmoji}\n`;
  } else if (rng <= 26) { // 20% menor
    const premio = 2000;
    await actualizarMonedas(sender, premio);
    await query(`UPDATE economia SET total_ganado = total_ganado + $1 WHERE jid = $2`, [premio, sender]);
    txt += `┊ 👍 No está mal, recuperaste la inversión y ganaste un poco más.\n`;
    txt += `┊ 💰 *Ganaste:* +${formatearNumero(premio)} ${config.economia.monedaEmoji}\n`;
  } else {
    txt += `┊ 🗑️ "Sigue participando..." \n`;
    txt += `┊ 💸 Has perdido tu boleto y no ganaste nada.\n`;
  }

  txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

  reply(txt);
}
