// @nombre: ppt
// @alias: ppt, piedrapapeltijera
// @categoria: economia
// @descripcion: Juega piedra, papel o tijera contra el bot y apuesta monedas

import { obtenerEconomia, actualizarMonedas, query } from '../../src/lib/database.js';
import { formatearNumero } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

export default async function (m, { sender, text, reply }) {
  const args = text.trim().split(' ');
  const opcionUsuario = args[0]?.toLowerCase();
  const apuestaStr = args[1];

  if (!opcionUsuario || !apuestaStr || isNaN(apuestaStr)) {
    return reply(`⚠️ *Uso incorrecto.*\n📌 *Ejemplo:* ${config.prefijo}ppt piedra 500\nOpciones válidas: piedra, papel, tijera`);
  }

  const apuesta = parseInt(apuestaStr);
  if (apuesta < 100) return reply('❌ La apuesta mínima es de 100 monedas.');

  const econ = await obtenerEconomia(sender);
  if (econ.monedas < apuesta) {
    return reply(`❌ No tienes suficientes monedas. Tienes: ${formatearNumero(econ.monedas)}`);
  }

  const opciones = ['piedra', 'papel', 'tijera'];
  if (!opciones.includes(opcionUsuario)) {
    return reply('❌ Opciones válidas: piedra, papel, tijera');
  }

  const opcionBot = opciones[Math.floor(Math.random() * opciones.length)];

  let resultado = '';
  let multiplicador = 0;

  if (opcionUsuario === opcionBot) {
    resultado = '¡Empate! 🤝';
    multiplicador = 0; // No gana ni pierde nada
  } else if (
    (opcionUsuario === 'piedra' && opcionBot === 'tijera') ||
    (opcionUsuario === 'papel' && opcionBot === 'piedra') ||
    (opcionUsuario === 'tijera' && opcionBot === 'papel')
  ) {
    resultado = '¡Ganaste! 🎉';
    multiplicador = 2; // Gana el doble
  } else {
    resultado = '¡Perdiste! 😭';
    multiplicador = -1; // Pierde la apuesta
  }

  const cambioMonedas = multiplicador === 0 ? 0 : 
                        multiplicador === -1 ? -apuesta : 
                        (apuesta * multiplicador) - apuesta; // ganancia neta (la apuesta ya la tenía)

  if (multiplicador !== 0) {
     // Si pierde, resto la apuesta. Si gana, le sumo la ganancia neta.
     await actualizarMonedas(sender, cambioMonedas);
  }

  // Actualizar stats (banco total de ganes/pérdidas)
  if (multiplicador > 0) {
    await query(`UPDATE economia SET total_ganado = total_ganado + $1 WHERE jid = $2`, [cambioMonedas, sender]);
  } else if (multiplicador < 0) {
    await query(`UPDATE economia SET total_perdido = total_perdido + $1 WHERE jid = $2`, [apuesta, sender]);
  }

  const emoji = (opcion) => opcion === 'piedra' ? '✊' : opcion === 'papel' ? '✋' : '✌️';

  let txt = `╭ ꒰ 🎮 𝓟𝓲𝓮𝓭𝓻𝓪 𝓟𝓪𝓹𝓮𝓵 𝓸 𝓣𝓲𝓳𝓮𝓻𝓪 🎮 ꒱\n`;
  txt += `┊ 👤 Tú: ${emoji(opcionUsuario)} (${opcionUsuario})\n`;
  txt += `┊ 🤖 Bot: ${emoji(opcionBot)} (${opcionBot})\n`;
  txt += `┊ ───────────────\n`;
  txt += `┊ ${resultado}\n`;
  
  if (multiplicador > 0) {
    txt += `┊ 💰 *Ganaste:* ${formatearNumero(cambioMonedas)} ${config.economia.monedaEmoji}\n`;
  } else if (multiplicador < 0) {
    txt += `┊ 💸 *Perdiste:* ${formatearNumero(apuesta)} ${config.economia.monedaEmoji}\n`;
  } else {
    txt += `┊ ⚖️ Tus monedas se devuelven.\n`;
  }
  
  txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

  reply(txt);
}
