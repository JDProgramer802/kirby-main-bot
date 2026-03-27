// @nombre: work
// @alias: work, trabajar, chambear
// @categoria: economia
// @descripcion: Trabaja para ganar algunas monedas

import { obtenerEconomia, actualizarMonedas, query } from '../../src/lib/database.js';
import { cooldownRestante, formatearTiempo, formatearNumero, elegirAleatorio } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

const trabajosKawaii = [
  "Ayudaste a Kirby a comerse un pastel",
  "Limpiaste el polvo espacial con una escoba mágica",
  "Trabajaste en el maid café sirviendo omurice",
  "Paseaste a unos perritos muy adorables",
  "Entregaste cajas de dulces mágicos",
  "Bailaste en la plaza y te lanzaron monedas",
  "Vendiste algodones de azúcar rosados",
  "Rescataste a un gatito de un árbol"
];

export default async function (m, { sender, reply }) {
  const econ = await obtenerEconomia(sender);
  
  const restantes = cooldownRestante(econ.ultimo_work, config.economia.cooldownWork);
  if (restantes > 0) {
    return reply(`❌ *Shhh, descansa un poquito~*\n⏳ Puedes volver a chambear en: *${formatearTiempo(restantes)}* 🌸`);
  }

  const premio = Math.floor(Math.random() * (400 - 100 + 1)) + 100;
  const trabajo = elegirAleatorio(trabajosKawaii);

  await actualizarMonedas(sender, premio);
  await query(`UPDATE economia SET ultimo_work = NOW(), total_ganado = total_ganado + $1 WHERE jid = $2`, [premio, sender]);

  let txt = `╭ ꒰ 🛠️ 𝓣𝓻𝓪𝓫𝓪𝓳𝓸 𝓓𝓾𝓻𝓸 🛠️ ꒱\n`;
  txt += `┊ 🌸 _${trabajo}_\n`;
  txt += `┊ 💰 *Ganancia:* +${formatearNumero(premio)} ${config.economia.monedaEmoji}\n`;
  txt += `┊ ✨ ¡Sigue esforzándote, amiguito!\n`;
  txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

  reply(txt);
}
