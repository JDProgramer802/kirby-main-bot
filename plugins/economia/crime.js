// @nombre: crime
// @alias: crime, crimen, robarbanco
// @categoria: economia
// @descripcion: Intenta cometer un crimen para ganar mucho, pero puedes terminar pagando una multa.

import { obtenerEconomia, query } from '../../src/lib/database.js';
import { cooldownRestante, formatearTiempo, formatearNumero } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

export default async function (m, { sender, isGroup, dbGroup, reply }) {
  if (isGroup && !dbGroup.economia_activa) {
    return reply('❌ *Oopsie~* La economía está desactivada aquí. 💸');
  }

  const econ = await obtenerEconomia(sender);
  
  const restantes = cooldownRestante(econ.ultimo_crime, config.economia.cooldownCrime);
  if (restantes > 0) {
    return reply(`❌ *¡Tranquilo forajido!* Ya hiciste muchas travesuras.\n⏳ Escóndete por: *${formatearTiempo(restantes)}* 🌸`);
  }

  // 40% de éxito
  const exito = Math.random() < 0.4;

  try {
    if (exito) {
      const ganancia = Math.floor(Math.random() * (2000 - 800 + 1)) + 800;
      await query(`UPDATE economia SET monedas = monedas + $1, ultimo_crime = NOW(), total_ganado = total_ganado + $1 WHERE jid = $2`, [ganancia, sender]);
      
      let txt = `╭ ꒰ 🥷 𝓒𝓻𝓲𝓶𝓮𝓷 𝓚𝓪𝔀𝓪𝓲𝓲 🥷 ꒱\n`;
      txt += `┊ 🔪 _Hackeaste el banco de Dedede con éxito._\n`;
      txt += `┊ 💰 *Botín:* +${formatearNumero(ganancia)} ${config.economia.monedaEmoji}\n`;
      txt += `┊ ✨ _¡Corre antes de que te atrapen!_\n`;
      txt += `╰━━━━━━━━━━━━━━━━━ 💸`;
      reply(txt);
    } else {
      const multa = Math.floor(Math.random() * (800 - 200 + 1)) + 200;
      // Puede quedar en negativo o en 0, lo dejamos descontar directo
      await query(`UPDATE economia SET monedas = CASE WHEN monedas >= $1 THEN monedas - $1 ELSE 0 END, ultimo_crime = NOW(), total_perdido = total_perdido + $1 WHERE jid = $2`, [multa, sender]);
      
      let txt = `╭ ꒰ 👮‍♀️ 𝓐𝓽𝓻𝓪𝓹𝓪𝓭𝓸 👮‍♀️ ꒱\n`;
      txt += `┊ 🚓 _La policía Waddle Dee te atrapó robando galletas._\n`;
      txt += `┊ 💸 *Multa:* -${formatearNumero(multa)} ${config.economia.monedaEmoji}\n`;
      txt += `┊ 💔 _Eso te enseñará a no ser un chico malo._\n`;
      txt += `╰━━━━━━━━━━━━━━━━━ 🌧️`;
      reply(txt);
    }
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Todo salió mal con el sistema. Escapaste gratis esta vez.');
  }
}
