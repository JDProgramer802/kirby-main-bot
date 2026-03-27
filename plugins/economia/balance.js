// @nombre: balance
// @alias: bal, coins, perfil, cartera
// @categoria: economia
// @descripcion: Muestra la cantidad de monedas y dinero en el banco

import { obtenerEconomia } from '../../src/lib/database.js';
import config from '../../src/lib/config.js';
import { formatearNumero, extraerMenciones, obtenerCitado } from '../../src/lib/utils.js';

export default async function (m, { conn, isGroup, sender, reply }) {
  let objetivo = sender;

  // Por si quieren ver el balance de otro
  if (isGroup) {
    let mencionado = extraerMenciones(m)[0];
    let citado = obtenerCitado(m);
    if (mencionado) objetivo = mencionado;
    else if (citado) objetivo = citado.jid;
  }

  const dbEcon = await obtenerEconomia(objetivo);
  const total = dbEcon.monedas + dbEcon.banco;

  const esPropio = objetivo === sender;
  const nombreTag = `@${objetivo.split('@')[0]}`;

  let txt = `╭ ꒰ 💳 𝓒𝓪𝓻𝓽𝓮𝓻𝓪 𝓚𝓪𝔀𝓪𝓲𝓲 💳 ꒱\n`;
  txt += `┊ 👤 ${esPropio ? 'Tu cartera' : `Cartera de ${nombreTag}`}\n`;
  txt += `┊ 👛 *Bolsillo:* ${formatearNumero(dbEcon.monedas)} ${config.economia.monedaEmoji}\n`;
  txt += `┊ 🏦 *Banco:* ${formatearNumero(dbEcon.banco)} ${config.economia.monedaEmoji}\n`;
  txt += `┊ ✨ *Total:* ${formatearNumero(total)} ${config.economia.monedaEmoji}\n`;
  txt += `╰━━━━━━━━━━━━━━━━━ 💰`;

  reply(txt);
}
