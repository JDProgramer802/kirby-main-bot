// @nombre: economyinfo
// @alias: economyinfo, stats, statsbanco
// @categoria: economia
// @descripcion: Muestra estadísticas personales de ganancias y pérdidas

import { obtenerEconomia } from '../../src/lib/database.js';
import { formatearNumero, extraerMenciones, obtenerCitado } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

export default async function (m, { isGroup, dbGroup, sender, reply }) {
  if (isGroup && !dbGroup.economia_activa) {
    return reply('❌ *Oopsie~* La economía está desactivada aquí. 💸');
  }

  let objetivo = sender;
  let mencionado = extraerMenciones(m)[0];
  let citado = obtenerCitado(m);
  if (mencionado) objetivo = mencionado;
  else if (citado) objetivo = citado.jid;

  try {
    const econ = await obtenerEconomia(objetivo);
    
    let saldoNeto = Number(econ.total_ganado) - Number(econ.total_perdido);
    let emojiNeto = saldoNeto >= 0 ? '📈' : '📉';

    let txt = `╭ ꒰ 📊 𝓔𝓼𝓽𝓪𝓭𝓲𝓼𝓽𝓲𝓬𝓪𝓼 📊 ꒱\n`;
    txt += `┊ 👤 *Usuario:* @${objetivo.split('@')[0]}\n`;
    txt += `┊ 💚 *Total Ganado:* ${formatearNumero(econ.total_ganado)} ${config.economia.monedaEmoji}\n`;
    txt += `┊ 💔 *Total Perdido:* ${formatearNumero(econ.total_perdido)} ${config.economia.monedaEmoji}\n`;
    txt += `┊ ${emojiNeto} *Balance Histórico:* ${formatearNumero(saldoNeto)} ${config.economia.monedaEmoji}\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Hubo un error al buscar las estadísticas.');
  }
}
