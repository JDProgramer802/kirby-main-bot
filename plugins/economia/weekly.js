// @nombre: weekly
// @alias: weekly, semanal
// @categoria: economia
// @descripcion: Reclama tu gran recompensa semanal de monedas

import { obtenerEconomia, actualizarMonedas, query } from '../../src/lib/database.js';
import { cooldownRestante, formatearTiempo, formatearNumero } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

export default async function (m, { sender, reply }) {
  const econ = await obtenerEconomia(sender);
  
  const COOLDOWN_WEEKLY = 7 * 24 * 60 * 60 * 1000; // 7 días
  const restantes = cooldownRestante(econ.ultimo_weekly, COOLDOWN_WEEKLY);
  if (restantes > 0) {
    return reply(`❌ *¡Tranquilo, vaquero!*\n⏳ Ya cobraste tu mesada. Vuelve en: *${formatearTiempo(restantes)}* 🗓️`);
  }

  // Premio aleatorio entre 5000 y 15000
  const premio = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;

  // Actualizar BD
  await actualizarMonedas(sender, premio);
  await query(`UPDATE economia SET ultimo_weekly = NOW(), total_ganado = total_ganado + $1 WHERE jid = $2`, [premio, sender]);

  let txt = `╭ ꒰ 🌟 𝓡𝓮𝓬𝓸𝓶𝓹𝓮𝓷𝓼𝓪 𝓢𝓮𝓶𝓪𝓷𝓪𝓵 🌟 ꒱\n`;
  txt += `┊ ✨ ¡Wow! ¡Recibiste tu gran cofre semanal!\n`;
  txt += `┊ 💰 *Ganaste:* +${formatearNumero(premio)} ${config.economia.monedaEmoji}\n`;
  txt += `┊ 🎀 ¡No te lo gastes todo en dulces!\n`;
  txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

  reply(txt);
}
