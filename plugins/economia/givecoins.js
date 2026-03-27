// @nombre: givecoins
// @alias: givecoins, pay, pagar, transferir
// @categoria: economia
// @descripcion: Transfiere monedas a otro usuario (Uso: /pay @user [cantidad])

import config from '../../src/lib/config.js';
import { actualizarMonedas, descontarMonedas } from '../../src/lib/database.js';
import { extraerMenciones, formatearNumero, obtenerCitado } from '../../src/lib/utils.js';

export default async function (m, { conn, args, sender, isGroup, dbGroup, text, reply }) {
  if (isGroup && !dbGroup.economia_activa) {
    return reply('❌ *Oopsie~* La economía está desactivada aquí. 💸');
  }

  let usuarioObjetivo = extraerMenciones(m)[0];
  const citado = obtenerCitado(m);

  if (!usuarioObjetivo && citado) {
    usuarioObjetivo = citado.jid;
  }

  if (!usuarioObjetivo) {
    return reply('⚠️ *¡Ay!* Menciona a quién le quieres transferir moneditas. `Ejemplo: /pay @user 100` 🌸');
  }

  if (usuarioObjetivo === sender) {
    return reply('❌ *Eh...* No puedes pasarte monedas a ti mismo. Qué bobito~ 🥺');
  }

  // Limpiar menciones de los args para extraer cantidad
  const cantidadStr = text.replace(/@\d+/g, '').trim().split(' ')[0];
  const cantidad = parseInt(cantidadStr);

  if (isNaN(cantidad) || cantidad <= 0) {
    return reply('❌ *¡Cuidado!* Ingresa un numerito válido. 🥺');
  }

  try {
    // Descontar al que envía (usando la nueva función inteligente)
    await descontarMonedas(sender, cantidad);

    // Sumar al que recibe
    await actualizarMonedas(usuarioObjetivo, cantidad);

    let txt = `╭ ꒰ 💸 𝓣𝓻𝓪𝓷𝓼𝓯𝓮𝓻𝓮𝓷𝓬𝓲𝓪 𝓚𝓪𝔀𝓪𝓲𝓲 💸 ꒱\n`;
    txt += `┊ ✨ Transfiriste moneditas con éxito.\n`;
    txt += `┊ 👤 *Recibe:* @${usuarioObjetivo.split('@')[0]}\n`;
    txt += `┊ 💰 *Cantidad:* ${formatearNumero(cantidad)} ${config.economia.monedaEmoji}\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    await conn.sendMessage(m.key.remoteJid, { text: txt, mentions: [usuarioObjetivo] }, { quoted: m });

  } catch (err) {
    console.error(err);
    // El error de descontarMonedas ya es descriptivo
    reply(`❌ *Oh no...* ${err.message}`);
  }
}
