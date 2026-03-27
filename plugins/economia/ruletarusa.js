// @nombre: ruletarusa
// @alias: ruletarusa, russianroulette, apostarvida
// @categoria: economia
// @descripcion: Apuestas todas tus monedas o una cantidad alta, tienes 1/6 probabilidad de perder todo.

import { obtenerEconomia, actualizarMonedas, query } from '../../src/lib/database.js';
import { formatearNumero } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

export default async function (m, { sender, text, reply }) {
  const args = text.trim().split(' ');
  let apuestaStr = args[0];

  const econ = await obtenerEconomia(sender);

  if (apuestaStr === 'all' || apuestaStr === 'todo') {
    apuestaStr = econ.monedas.toString();
  }

  if (!apuestaStr || isNaN(apuestaStr)) {
    return reply(`⚠️ *Uso incorrecto.*\n📌 *Ejemplo:* ${config.prefijo}ruletarusa 1000\nO también:\n📌 *Ejemplo:* ${config.prefijo}ruletarusa todo\nApuesta mínima: 500 monedas`);
  }

  const apuesta = parseInt(apuestaStr);
  if (apuesta < 500) return reply('❌ La apuesta mínima es de 500 monedas.');

  if (econ.monedas < apuesta) {
    return reply(`❌ No tienes suficientes monedas. Tienes: ${formatearNumero(econ.monedas)}`);
  }

  // 1 en 6 probabilidades de morir (perder todo)
  const bala = Math.floor(Math.random() * 6) + 1; // Un número aleatorio del 1 al 6
  const tiro = 1; // La cámara donde está la bala "1"

  let txt = `╭ ꒰ 🔫 𝓡𝓾𝓵𝓮𝓽𝓪 𝓡𝓾𝓼𝓪 🔫 ꒱\n`;
  txt += `┊ 😨 Pones el revólver en la mesa...\n`;
  txt += `┊ 🎯 Haces girar el tambor y presionas el gatillo...\n`;
  txt += `┊ ───────────────\n`;

  if (bala === tiro) { 
    // Muere y pierde la apuesta, y como penalización extra, pierde TODA la salud o algo.
    // Solo le quitamos la apuesta.
    await actualizarMonedas(sender, -apuesta);
    await query(`UPDATE economia SET total_perdido = total_perdido + $1 WHERE jid = $2`, [apuesta, sender]);

    txt += `┊ 💥 ¡BANG! 💥\n`;
    txt += `┊ 💀 Caíste. Has perdido ${formatearNumero(apuesta)} ${config.economia.monedaEmoji}.\n`;
  } else {
    // Sobrevive y gana el doble? No, gana un porcentaje de lo apostado, ej. gana el 50% de la apuesta
    const ganancia = Math.floor(apuesta * 0.5);
    await actualizarMonedas(sender, ganancia);
    await query(`UPDATE economia SET total_ganado = total_ganado + $1 WHERE jid = $2`, [ganancia, sender]);

    txt += `┊ 🌬️ *Click...*\n`;
    txt += `┊ 😌 Sobreviviste de milagro.\n`;
    txt += `┊ 💰 *Ganancia:* +${formatearNumero(ganancia)} ${config.economia.monedaEmoji} (Ganaste 50% extra por el riesgo).\n`;
  }

  txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

  reply(txt);
}
