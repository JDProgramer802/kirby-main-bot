// @nombre: daily
// @alias: daily, reclamar, recompensa
// @categoria: economia
// @descripcion: Reclama tu recompensa diaria de monedas

import { obtenerEconomia, actualizarMonedas, query } from '../../src/lib/database.js';
import { cooldownRestante, formatearTiempo, formatearNumero } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

export default async function (m, { sender, reply }) {
  const econ = await obtenerEconomia(sender);
  
  // Revisar cooldown
  const restantes = cooldownRestante(econ.ultimo_daily, config.economia.cooldownDaily);
  if (restantes > 0) {
    return reply(`❌ *Tranqui amiguito~* Ya reclamaste tu recompensa.\n⏳ Vuelve en: *${formatearTiempo(restantes)}* 🌸`);
  }

  // Premio aleatorio entre 500 y 1500
  const premio = Math.floor(Math.random() * (1500 - 500 + 1)) + 500;

  // Actualizar BD
  await actualizarMonedas(sender, premio);
  await query(`UPDATE economia SET ultimo_daily = NOW(), total_ganado = total_ganado + $1 WHERE jid = $2`, [premio, sender]);

  let txt = `╭ ꒰ 🎁 𝓡𝓮𝓬𝓸𝓶𝓹𝓮𝓷𝓼𝓪 𝓓𝓲𝓪𝓻𝓲𝓪 🎁 ꒱\n`;
  txt += `┊ ✨ ¡Yaaay! Reclamaste tu premio diario.\n`;
  txt += `┊ 💰 *Ganaste:* +${formatearNumero(premio)} ${config.economia.monedaEmoji}\n`;
  txt += `┊ 🎀 Vuelve mañana por más regalitos~\n`;
  txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

  reply(txt);
}
