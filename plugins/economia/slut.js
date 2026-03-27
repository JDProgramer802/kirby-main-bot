// @nombre: slut
// @alias: slut, putear, p
// @categoria: economia
// @descripcion: Vende tu cuerpecito para conseguir dinero (Riesgoso)

import { obtenerEconomia, query } from '../../src/lib/database.js';
import { cooldownRestante, formatearTiempo, formatearNumero } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

export default async function (m, { sender, isGroup, dbGroup, reply }) {
  if (isGroup && !dbGroup.economia_activa) {
    return reply('❌ *Oopsie~* La economía está desactivada. 💸');
  }

  const econ = await obtenerEconomia(sender);
  
  const restantes = cooldownRestante(econ.ultimo_slut, config.economia.cooldownSlut);
  if (restantes > 0) {
    return reply(`❌ *¡Ay pecador!* Tienes que descansar un poquito de tanta acción.\n⏳ Inténtalo en: *${formatearTiempo(restantes)}* 💦`);
  }

  // 60% éxito
  const exito = Math.random() < 0.6;

  try {
    if (exito) {
      const ganancia = Math.floor(Math.random() * (1200 - 500 + 1)) + 500;
      await query(`UPDATE economia SET monedas = monedas + $1, ultimo_slut = NOW(), total_ganado = total_ganado + $1 WHERE jid = $2`, [ganancia, sender]);
      
      let txt = `╭ ꒰ 💋 𝓣𝓻𝓪𝓫𝓪𝓳𝓲𝓽𝓸 𝓘𝓷𝓽𝓲𝓶𝓸 💋 ꒱\n`;
      txt += `┊ ✨ _A un sugar daddy le encantaste..._\n`;
      txt += `┊ 💰 *Propina:* +${formatearNumero(ganancia)} ${config.economia.monedaEmoji}\n`;
      txt += `┊ 💦 _Toma una ducha, rápido._\n`;
      txt += `╰━━━━━━━━━━━━━━━━━ 💕`;
      reply(txt);
    } else {
      const multa = Math.floor(Math.random() * (600 - 200 + 1)) + 200;
      await query(`UPDATE economia SET monedas = CASE WHEN monedas >= $1 THEN monedas - $1 ELSE 0 END, ultimo_slut = NOW(), total_perdido = total_perdido + $1 WHERE jid = $2`, [multa, sender]);
      
      let txt = `╭ ꒰ 🚔 𝓡𝓮𝓭𝓪𝓭𝓪 🚔 ꒱\n`;
      txt += `┊ 🚓 _La policía anti-horny te atrapó en el acto._\n`;
      txt += `┊ 💸 *Multa pagada:* -${formatearNumero(multa)} ${config.economia.monedaEmoji}\n`;
      txt += `┊ 💔 _Guarda eso de vuelta en tus pantalones._\n`;
      txt += `╰━━━━━━━━━━━━━━━━━ 🌧️`;
      reply(txt);
    }
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Alguien interrumpió el acto.');
  }
}
