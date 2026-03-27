// @nombre: beg
// @alias: beg, mendigar, pedir
// @categoria: economia
// @descripcion: Pide moneditas con ojitos tiernos

import { obtenerEconomia, actualizarMonedas, query } from '../../src/lib/database.js';
import { cooldownRestante, formatearTiempo, formatearNumero, elegirAleatorio } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

const donadores = [
  "Rey Dedede",
  "Meta Knight",
  "Bandana Waddle Dee",
  "Chef Kawasaki",
  "Magolor",
  "Marx",
  "Taranza",
  "Susie",
  "Gooey"
];

export default async function (m, { sender, reply }) {
  const econ = await obtenerEconomia(sender);
  
  const COOLDOWN_BEG = 5 * 60 * 1000; // 5 minutos
  const restantes = cooldownRestante(econ.ultimo_beg, COOLDOWN_BEG);
  if (restantes > 0) {
    return reply(`❌ *¡Poyo! No seas tan insistente...*\n⏳ Espera a que se les olvide en: *${formatearTiempo(restantes)}* 🥺`);
  }

  const donador = elegirAleatorio(donadores);
  const exito = Math.random() < 0.7; // 70% de probabilidad de éxito

  if (exito) {
    const premio = Math.floor(Math.random() * (300 - 50 + 1)) + 50;
    
    await actualizarMonedas(sender, premio);
    await query(`UPDATE economia SET ultimo_beg = NOW(), total_ganado = total_ganado + $1 WHERE jid = $2`, [premio, sender]);

    let txt = `╭ ꒰ 🥺 𝓤𝓷𝓪 𝓐𝔂𝓾𝓭𝓲𝓽𝓪 🥺 ꒱\n`;
    txt += `┊ ✨ Hiciste ojitos tiernos y... ¡Funcionó!\n`;
    txt += `┊ 💝 *${donador}* sintió ternura y te dio unas monedas.\n`;
    txt += `┊ 💰 *Ganaste:* +${formatearNumero(premio)} ${config.economia.monedaEmoji}\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    return reply(txt);
  } else {
    await query(`UPDATE economia SET ultimo_beg = NOW() WHERE jid = $1`, [sender]);
    
    let txt = `╭ ꒰ 🥺 𝓤𝓷𝓪 𝓐𝔂𝓾𝓭𝓲𝓽𝓪 🥺 ꒱\n`;
    txt += `┊ 💔 Hiciste ojitos tiernos pero...\n`;
    txt += `┊ 💨 *${donador}* te ignoró completamente y se fue.\n`;
    txt += `┊ 😭 No conseguiste nada esta vez.\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    return reply(txt);
  }
}
