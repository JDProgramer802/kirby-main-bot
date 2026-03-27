// @nombre: fish
// @alias: fish, pescar
// @categoria: economia
// @descripcion: Atrapa peces adorables y véndelos por monedas

import { obtenerEconomia, actualizarMonedas, query } from '../../src/lib/database.js';
import { cooldownRestante, formatearTiempo, formatearNumero, elegirAleatorio } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

const mensajesPesca = [
  "Pescaste un Magikarp... no, espera, es un pez dorado muy caro",
  "Atrapaste un botín perdido flotando en el agua",
  "Un delfín te trajo un tesoro hundido",
  "¡Pescaste un pulpo gigante! Lo vendiste en el mercado",
  "Pescaste una bota vieja... pero tenía monedas adentro"
];

export default async function (m, { sender, reply }) {
  const econ = await obtenerEconomia(sender);
  
  const COOLDOWN_FISH = 8 * 60 * 1000; // 8 minutos
  const restantes = cooldownRestante(econ.ultimo_fish, COOLDOWN_FISH);
  if (restantes > 0) {
    return reply(`❌ *Tranquilidad, el lago está vacío!*\n⏳ Los peces volverán en: *${formatearTiempo(restantes)}* 🎣`);
  }

  const premio = Math.floor(Math.random() * (500 - 100 + 1)) + 100;
  const mensaje = elegirAleatorio(mensajesPesca);

  await actualizarMonedas(sender, premio);
  await query(`UPDATE economia SET ultimo_fish = NOW(), total_ganado = total_ganado + $1 WHERE jid = $2`, [premio, sender]);

  let txt = `╭ ꒰ 🎣 𝓓𝓲𝓪 𝓭𝓮 𝓟𝓮𝓼𝓬𝓪 🎣 ꒱\n`;
  txt += `┊ 🐟 _${mensaje}_\n`;
  txt += `┊ 💰 *Ganancia:* +${formatearNumero(premio)} ${config.economia.monedaEmoji}\n`;
  txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

  reply(txt);
}
