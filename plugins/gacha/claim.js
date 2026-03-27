// @nombre: claim
// @alias: claim, c, capturar
// @categoria: gacha
// @descripcion: Reclama el último personaje invocado en el grupo.

import { obtenerEconomia, query } from '../../src/lib/database.js';
import { formatearNumero } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

export default async function (m, { conn, sender, isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');
  if (!dbGroup.gacha_activo) return reply('❌ *Aww...* El gacha de anime está desactivado aquí. 😿');

  global.gachaDrops = global.gachaDrops || {};
  const personajeDrop = global.gachaDrops[m.key.remoteJid];

  if (!personajeDrop) {
    return reply('⚠️ *¡Ay!* No hay ningún personaje esperando a ser reclamado.\nUsa `/roll` primero. 🌸');
  }

  const econ = await obtenerEconomia(sender);
  const costo = config.gacha.precioClaim;

  if (Number(econ.monedas) < costo) {
    return reply(`❌ *Ay no...* Reclamar a un personaje cuesta ${costo} ${config.economia.monedaEmoji}.\nSolo tienes ${formatearNumero(econ.monedas)}. 😿`);
  }

  try {
    // Comprobar si el usuario ya lo tiene en su BD harem
    const hasChar = await query(
      `SELECT id FROM harem WHERE jid_usuario = $1 AND personaje_id = $2`,
      [sender, personajeDrop.db_id]
    );

    if (hasChar.rows.length > 0) {
      return reply(`⚠️ *¡Ya lo tienes!* ${personajeDrop.nombre} ya está en tu harem. Deja algo para los demás~ 💕`);
    }

    // Cobrar al usuario y agregar al harem
    await query(`UPDATE economia SET monedas = monedas - $1 WHERE jid = $2`, [costo, sender]);
    await query(
      `INSERT INTO harem (jid_usuario, personaje_id) VALUES ($1, $2)`,
      [sender, personajeDrop.db_id]
    );

    // Borrar el drop para que nadie más lo tome
    delete global.gachaDrops[m.key.remoteJid];

    let txt = `╭ ꒰ 🎉 𝓒𝓪𝓹𝓽𝓾𝓻𝓪 𝓔𝔁𝓲𝓽𝓸𝓼𝓪 🎉 ꒱\n`;
    txt += `┊ ✨ ¡Felicidades @${sender.split('@')[0]}!\n`;
    txt += `┊ 💖 **${personajeDrop.nombre}** ahora es tuyo/a.\n`;
    txt += `┊ 💰 Costo: -${costo} ${config.economia.monedaEmoji}\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    await conn.sendMessage(m.key.remoteJid, {
      text: txt,
      mentions: [sender]
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Hubo un error procesando el registro matrimonial. Intenta de nuevo.');
  }
}
