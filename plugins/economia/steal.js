// @nombre: steal
// @alias: steal, robar
// @categoria: economia
// @descripcion: Intenta robarle algo de su bolsillo a otro usuario

import { extraerMenciones, obtenerCitado, cooldownRestante, formatearTiempo, formatearNumero } from '../../src/lib/utils.js';
import { obtenerEconomia, query } from '../../src/lib/database.js';
import config from '../../src/lib/config.js';

export default async function (m, { isGroup, dbGroup, sender, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');
  if (!dbGroup.economia_activa) return reply('❌ *Oopsie~* La economía está desactivada. 💸');

  let objetivo = extraerMenciones(m)[0];
  const citado = obtenerCitado(m);
  if (!objetivo && citado) objetivo = citado.jid;

  if (!objetivo) {
    return reply('⚠️ *¡Ay!* Menciona a tu víctima o responde a su mensajito. 🥷');
  }

  if (objetivo === sender) {
    return reply('❌ *¿Eh?* No puedes robarte a ti mismo, bobo~ 🥺');
  }

  const miRiqueza = await obtenerEconomia(sender);
  const restantes = cooldownRestante(miRiqueza.ultimo_steal, config.economia.cooldownSteal);
  
  if (restantes > 0) {
    return reply(`❌ *¡Calma forajido!* Ya robaste demasiado hoy.\n⏳ Escóndete por: *${formatearTiempo(restantes)}* 🌸`);
  }

  const suRiqueza = await obtenerEconomia(objetivo);
  if (suRiqueza.monedas < 500) {
    return reply('❌ *Aww...* Tu víctima es demasiado pobre. No vale la pena robarle. 😭');
  }

  // Lógica de robo (50% de éxito de robar un 10 a 20%)
  const exito = Math.random() < 0.5;

  try {
    if (exito) {
      const porcentaje = Math.random() * (0.20 - 0.10) + 0.10;
      const botin = Math.floor(suRiqueza.monedas * porcentaje);

      await query(`UPDATE economia SET monedas = monedas + $1, ultimo_steal = NOW(), total_ganado = total_ganado + $1 WHERE jid = $2`, [botin, sender]);
      await query(`UPDATE economia SET monedas = monedas - $1, total_perdido = total_perdido + $1 WHERE jid = $2`, [botin, objetivo]);

      let txt = `╭ ꒰ 🥷 𝓡𝓸𝓫𝓸 𝓔𝔁𝓲𝓽𝓸𝓼𝓸 🥷 ꒱\n`;
      txt += `┊ ✨ _Te acercaste sigilosamente y sacaste algo de su cartera..._\n`;
      txt += `┊ 💰 *Robado:* +${formatearNumero(botin)} ${config.economia.monedaEmoji}\n`;
      txt += `┊ 👤 *De:* @${objetivo.split('@')[0]}\n`;
      txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

      reply(txt);
    } else {
      // Si falla, paga una multa al usuario
      const multa = Math.floor(Math.random() * (600 - 300 + 1)) + 300;
      await query(`UPDATE economia SET monedas = CASE WHEN monedas >= $1 THEN monedas - $1 ELSE 0 END, ultimo_steal = NOW(), total_perdido = total_perdido + $1 WHERE jid = $2`, [multa, sender]);
      await query(`UPDATE economia SET monedas = monedas + $1, total_ganado = total_ganado + $1 WHERE jid = $2`, [multa, objetivo]);

      let txt = `╭ ꒰ 👮‍♀️ 𝓐𝓽𝓻𝓪𝓹𝓪𝓭𝓸 👮‍♀️ ꒱\n`;
      txt += `┊ 🚓 _@${objetivo.split('@')[0]} te pilló intentando robarle._\n`;
      txt += `┊ 💸 *Lo compensaste con:* -${formatearNumero(multa)} ${config.economia.monedaEmoji}\n`;
      txt += `┊ 💔 _Vaya humillación..._\n`;
      txt += `╰━━━━━━━━━━━━━━━━━ 🌧️`;

      reply(txt);
    }
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Todo salió mal con el robo. Saliste ileso de milagro.');
  }
}
