// @nombre: mine
// @alias: mine, minar, excavar
// @categoria: economia
// @descripcion: Mina para buscar piedras preciosas y monedas

import { obtenerEconomia, actualizarMonedas, query } from '../../src/lib/database.js';
import { cooldownRestante, formatearTiempo, formatearNumero, elegirAleatorio } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

const mensajesMinado = [
  "Encontraste cristales brillantes en la cueva",
  "Picaste una roca y salieron muchas monedas",
  "Desenterraste un cofre antiguo",
  "Un topo amistoso te regaló algunas gemas",
  "Kirby aspiró una roca y escupió oro"
];

export default async function (m, { sender, reply }) {
  const econ = await obtenerEconomia(sender);
  
  const COOLDOWN_MINE = 10 * 60 * 1000; // 10 minutos
  const restantes = cooldownRestante(econ.ultimo_mine, COOLDOWN_MINE);
  if (restantes > 0) {
    return reply(`❌ *¡Uf, qué cansancio!*\n⏳ Tu pico necesita reparaciones. Vuelve a minar en: *${formatearTiempo(restantes)}* ⛏️`);
  }

  const premio = Math.floor(Math.random() * (600 - 150 + 1)) + 150;
  const mensaje = elegirAleatorio(mensajesMinado);

  await actualizarMonedas(sender, premio);
  await query(`UPDATE economia SET ultimo_mine = NOW(), total_ganado = total_ganado + $1 WHERE jid = $2`, [premio, sender]);

  let txt = `╭ ꒰ ⛏️ 𝓔𝔁𝓹𝓮𝓭𝓲𝓬𝓲𝓸𝓷 𝓜𝓲𝓷𝓮𝓻𝓪 ⛏️ ꒱\n`;
  txt += `┊ 💎 _${mensaje}_\n`;
  txt += `┊ 💰 *Ganancia:* +${formatearNumero(premio)} ${config.economia.monedaEmoji}\n`;
  txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

  reply(txt);
}
