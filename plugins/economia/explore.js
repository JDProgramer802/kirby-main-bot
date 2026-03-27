// @nombre: explore
// @alias: explore, explorar, aventura
// @categoria: economia
// @descripcion: Explora Dream Land en busca de recompensas

import { obtenerEconomia, actualizarMonedas, query } from '../../src/lib/database.js';
import { cooldownRestante, formatearTiempo, formatearNumero, elegirAleatorio } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

const mensajesExplorar = [
  "Exploraste Fountain of Dreams y hallaste polvo de estrellas",
  "Viajaste en la Estrella Warp y recolectaste monedas del cielo",
  "Encontraste un cuarto secreto en el Castillo de Dedede",
  "Kirby te llevó a dar un paseo y consiguieron botín",
  "Te perdiste en el bosque pero encontraste una bolsa perdida"
];

export default async function (m, { sender, reply }) {
  const econ = await obtenerEconomia(sender);
  
  const COOLDOWN_EXPLORE = 20 * 60 * 1000; // 20 minutos
  const restantes = cooldownRestante(econ.ultimo_explore, COOLDOWN_EXPLORE);
  if (restantes > 0) {
    return reply(`❌ *¡Qué cansado estás de tanto caminar!*\n⏳ Descansa un poco y vuelve a explorar en: *${formatearTiempo(restantes)}* 🗺️`);
  }

  const premio = Math.floor(Math.random() * (1000 - 300 + 1)) + 300;
  const mensaje = elegirAleatorio(mensajesExplorar);

  await actualizarMonedas(sender, premio);
  await query(`UPDATE economia SET ultimo_explore = NOW(), total_ganado = total_ganado + $1 WHERE jid = $2`, [premio, sender]);

  let txt = `╭ ꒰ 🗺️ 𝓐𝓿𝓮𝓷𝓽𝓾𝓻𝓪 𝓔𝓹𝓲𝓬𝓪 🗺️ ꒱\n`;
  txt += `┊ 🌟 _${mensaje}_\n`;
  txt += `┊ 💰 *Ganancia:* +${formatearNumero(premio)} ${config.economia.monedaEmoji}\n`;
  txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

  reply(txt);
}
