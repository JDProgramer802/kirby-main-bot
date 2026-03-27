// @nombre: hunt
// @alias: hunt, cazar
// @categoria: economia
// @descripcion: Ve de caza en el bosque encantado

import { obtenerEconomia, actualizarMonedas, query } from '../../src/lib/database.js';
import { cooldownRestante, formatearTiempo, formatearNumero, elegirAleatorio } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

const mensajesCaza = [
  "Cazaste a un Whispy Woods pequeñito y soltó manzanas de oro",
  "Encontraste un Waddle Dee perdido y te recompensó",
  "Cazaste mariposas brillantes muy raras",
  "Atrapaste un montón de estrellas fugaces",
  "Cazaste... ¡un tesoro abandonado en el bosque!"
];

export default async function (m, { sender, reply }) {
  const econ = await obtenerEconomia(sender);
  
  const COOLDOWN_HUNT = 15 * 60 * 1000; // 15 minutos
  const restantes = cooldownRestante(econ.ultimo_hunt, COOLDOWN_HUNT);
  if (restantes > 0) {
    return reply(`❌ *Hushhh, harás ruido!*\n⏳ Los animalitos están escondidos. Intenta cazar en: *${formatearTiempo(restantes)}* 🏹`);
  }

  const premio = Math.floor(Math.random() * (800 - 200 + 1)) + 200;
  const mensaje = elegirAleatorio(mensajesCaza);

  await actualizarMonedas(sender, premio);
  await query(`UPDATE economia SET ultimo_hunt = NOW(), total_ganado = total_ganado + $1 WHERE jid = $2`, [premio, sender]);

  let txt = `╭ ꒰ 🏹 𝓣𝓮𝓶𝓹𝓸𝓻𝓪𝓭𝓪 𝓭𝓮 𝓒𝓪𝔃𝓪 🏹 ꒱\n`;
  txt += `┊ 🦌 _${mensaje}_\n`;
  txt += `┊ 💰 *Ganancia:* +${formatearNumero(premio)} ${config.economia.monedaEmoji}\n`;
  txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

  reply(txt);
}
