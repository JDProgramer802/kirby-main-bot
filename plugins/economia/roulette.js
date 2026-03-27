// @nombre: roulette
// @alias: roulette, ruleta, rt
// @categoria: economia
// @descripcion: Apuesta en la ruleta (rojo/negro/verde). Uso: /rt [rojo/negro/verde] [cantidad]

import { query, obtenerEconomia, cache } from '../../src/lib/database.js';
import { formatearNumero } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

export default async function (m, { args, sender, isGroup, dbGroup, reply }) {
  if (isGroup && !dbGroup.economia_activa) {
    return reply('❌ *Oopsie~* La economía está desactivada en este grupito. 💸');
  }

  const validos = ['rojo', 'negro', 'verde'];
  if (args.length < 2 || !validos.includes(args[0].toLowerCase())) {
    return reply('⚠️ *¡Ay!* Dime a qué color le vas y cuánto. `Ejemplo: /rt rojo 100`\nColores: rojo (x2), negro (x2), verde (x14) 🌸');
  }

  const color = args[0].toLowerCase();
  const econ = await obtenerEconomia(sender);
  
  let apuesta = 0;
  if (args[1].toLowerCase() === 'all' || args[1].toLowerCase() === 'todo') {
    apuesta = Number(econ.monedas);
  } else {
    apuesta = parseInt(args[1]);
  }

  if (isNaN(apuesta) || apuesta <= 0) {
    return reply('❌ *¡Cuidado!* Ingresa un número válido para apostar. 🥺');
  }

  if (Number(econ.monedas) < apuesta) {
    return reply(`❌ *Ay no...* No tienes tantas monedas.\nSolo tienes ${formatearNumero(econ.monedas)} ${config.economia.monedaEmoji}. 😿`);
  }

  // Lógica ruleta (14 negro, 14 rojo, 1 verde = 29 opciones aprox)
  // Probabilidad: rojo 48%, negro 48%, verde 4%
  const rand = Math.random();
  let resultadoColor = '';
  if (rand < 0.04) resultadoColor = 'verde';
  else if (rand < 0.52) resultadoColor = 'rojo';
  else resultadoColor = 'negro';

  const gano = color === resultadoColor;

  try {
    if (gano) {
      const mult = resultadoColor === 'verde' ? 14 : 2;
      const gananciaTotal = apuesta * mult;
      const gananciaNeta = gananciaTotal - apuesta;

      await query(
        `UPDATE economia SET monedas = monedas + $1, total_ganado = total_ganado + $1 WHERE jid = $2`, 
        [gananciaNeta, sender]
      );
      
      let txt = `╭ ꒰ 🎲 𝓡𝓾𝓵𝓮𝓽𝓪 𝓚𝓪𝔀𝓪𝓲𝓲 🎲 ꒱\n`;
      txt += `┊ ✨ Cayó: *${resultadoColor.toUpperCase()}*\n`;
      txt += `┊ 🎉 _¡Increíble suerte! Ganaste tu apuesta (x${mult})._\n`;
      txt += `┊ 💰 *Premio:* +${formatearNumero(gananciaTotal)} ${config.economia.monedaEmoji}\n`;
      txt += `╰━━━━━━━━━━━━━━━━━ 💕`;
      reply(txt);
    } else {
      await query(
        `UPDATE economia SET monedas = monedas - $1, total_perdido = total_perdido + $1 WHERE jid = $2`, 
        [apuesta, sender]
      );
      
      let txt = `╭ ꒰ 🎲 𝓡𝓾𝓵𝓮𝓽𝓪 𝓚𝓪𝔀𝓪𝓲𝓲 🎲 ꒱\n`;
      txt += `┊ ☁️ Cayó: *${resultadoColor.toUpperCase()}*\n`;
      txt += `┊ 💔 _¡Oh no! El casino siempre gana..._\n`;
      txt += `┊ 💸 *Pérdida:* -${formatearNumero(apuesta)} ${config.economia.monedaEmoji}\n`;
      txt += `╰━━━━━━━━━━━━━━━━━ 🌧️`;
      reply(txt);
    }
    // Invalidar cache para que se actualice en el siguiente comando
    cache.economia.delete(sender);
  } catch (err) {
    console.error(err);
    reply('❌ *Oh no...* La ruleta se trabó. Intenta de nuevo.');
  }
}
