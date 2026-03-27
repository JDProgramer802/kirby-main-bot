// @nombre: dados
// @alias: dados, dice
// @categoria: economia
// @descripcion: Tira los dados contra el bot. ¡El que saca más alto, gana!

import { obtenerEconomia, actualizarMonedas, query } from '../../src/lib/database.js';
import { formatearNumero } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

export default async function (m, { sender, text, reply }) {
  const args = text.trim().split(' ');
  const apuestaStr = args[0];

  if (!apuestaStr || isNaN(apuestaStr)) {
    return reply(`⚠️ *Uso incorrecto.*\n📌 *Ejemplo:* ${config.prefijo}dados 500\nApuesta mínima: 100 monedas`);
  }

  const apuesta = parseInt(apuestaStr);
  if (apuesta < 100) return reply('❌ La apuesta mínima es de 100 monedas.');

  const econ = await obtenerEconomia(sender);
  if (econ.monedas < apuesta) {
    return reply(`❌ No tienes suficientes monedas. Tienes: ${formatearNumero(econ.monedas)}`);
  }

  // Tirada aleatoria entre 1 y 6
  const tiradaUsuario1 = Math.floor(Math.random() * 6) + 1;
  const tiradaUsuario2 = Math.floor(Math.random() * 6) + 1;
  const totalUsuario = tiradaUsuario1 + tiradaUsuario2;

  const tiradaBot1 = Math.floor(Math.random() * 6) + 1;
  const tiradaBot2 = Math.floor(Math.random() * 6) + 1;
  const totalBot = tiradaBot1 + tiradaBot2;

  let resultado = '';
  let cambioMonedas = 0;
  let exito = false;

  if (totalUsuario > totalBot) {
    resultado = '¡Ganaste! 🎉';
    cambioMonedas = apuesta; // ganancia = la cantidad apostada (el doble de su depósito)
    exito = true;
  } else if (totalBot > totalUsuario) {
    resultado = '¡Perdiste! 😭';
    cambioMonedas = -apuesta;
    exito = false;
  } else {
    resultado = '¡Empate! 🤝';
    cambioMonedas = 0;
  }

  if (cambioMonedas !== 0) {
    await actualizarMonedas(sender, cambioMonedas);
  }

  // Actualizar estadísticas de ganancias
  if (cambioMonedas > 0) {
    await query(`UPDATE economia SET total_ganado = total_ganado + $1 WHERE jid = $2`, [cambioMonedas, sender]);
  } else if (cambioMonedas < 0) {
    await query(`UPDATE economia SET total_perdido = total_perdido + $1 WHERE jid = $2`, [apuesta, sender]);
  }

  let txt = `╭ ꒰ 🎲 𝓓𝓾𝓮𝓵𝓸 𝓭𝓮 𝓓𝓪𝓭𝓸𝓼 🎲 ꒱\n`;
  txt += `┊ 👤 *Tú:* ${tiradaUsuario1} + ${tiradaUsuario2} = *${totalUsuario}*\n`;
  txt += `┊ 🤖 *Bot:* ${tiradaBot1} + ${tiradaBot2} = *${totalBot}*\n`;
  txt += `┊ ───────────────\n`;
  txt += `┊ ${resultado}\n`;
  
  if (cambioMonedas > 0) {
    txt += `┊ 💰 *Ganaste:* ${formatearNumero(cambioMonedas)} ${config.economia.monedaEmoji}\n`;
  } else if (cambioMonedas < 0) {
    txt += `┊ 💸 *Perdiste:* ${formatearNumero(apuesta)} ${config.economia.monedaEmoji}\n`;
  } else {
    txt += `┊ ⚖️ Se devuelven las monedas.\n`;
  }
  
  txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

  reply(txt);
}
