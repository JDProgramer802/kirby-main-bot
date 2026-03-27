// @nombre: roll
// @alias: roll, rw, me, waifu
// @categoria: gacha
// @descripcion: Invoca un personaje aleatorio de anime. Cuesta monedas.

import { rollearPersonaje } from '../../src/lib/anilist.js';
import { obtenerEconomia, query } from '../../src/lib/database.js';
import { cooldownRestante, formatearTiempo, formatearNumero } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

export default async function (m, { conn, sender, isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');
  if (!dbGroup.gacha_activo) return reply('❌ *Aww...* El gacha de anime está desactivado aquí. 😿');

  const econ = await obtenerEconomia(sender);
  const costo = config.gacha.precioRoll;

  if (Number(econ.monedas) < costo) {
    return reply(`❌ *Ay no...* Tirar del gacha cuesta ${costo} ${config.economia.monedaEmoji}.\nSolo tienes ${formatearNumero(econ.monedas)}. 😿`);
  }

  const restantes = cooldownRestante(econ.ultimo_roll, config.gacha.cooldownRoll);
  if (restantes > 0) {
    return reply(`❌ *Tranqui amiguito~* Ya tiraste al gacha hace poquito.\n⏳ Inténtalo en: *${formatearTiempo(restantes)}* 🌸`);
  }

  try {
    // Cobrar
    await query(`UPDATE economia SET monedas = monedas - $1, ultimo_roll = NOW() WHERE jid = $2`, [costo, sender]);
    
    reply('☁️ ✨ _Invocando magia de las estrellas..._');

    const personaje = await rollearPersonaje();

    // Guardar en memoria global para que alguien pueda hacer claim
    global.gachaDrops = global.gachaDrops || {};
    global.gachaDrops[m.key.remoteJid] = personaje;

    const rarezaEstrellas = '⭐'.repeat(personaje.rareza);

    let caption = `╭ ꒰ 🌸 𝓘𝓷𝓿𝓸𝓬𝓪𝓬𝓲𝓸𝓷 🌸 ꒱\n`;
    caption += `┊ 👤 *Nombre:* ${personaje.nombre}\n`;
    caption += `┊ 📺 *Serie:* ${personaje.serie}\n`;
    caption += `┊ ✨ *Rareza:* ${rarezaEstrellas}\n`;
    caption += `┊ ❤️ *Favoritos:* ${formatearNumero(personaje.favoritos)}\n`;
    caption += `┊ \n`;
    caption += `┊ 🎀 Usa \`/claim\` para agregarlo a tu harem.\n`;
    caption += `╰━━━━━━━━━━━━━━━━━ 💕`;

    const buttons = [
      { buttonId: `${config.prefijo}claim`, buttonText: { displayText: '💖 Reclamar Personaje' }, type: 1 }
    ];

    // Enviar imagen con botones
    await conn.sendMessage(m.key.remoteJid, {
      image: { url: personaje.imagen },
      caption: caption,
      buttons: buttons,
      headerType: 4
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Hubo un problema con el portal mágico. Intenta más tarde.');
  }
}
