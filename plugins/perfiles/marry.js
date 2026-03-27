// @nombre: marry
// @alias: marry, casarse, proponer
// @categoria: perfiles
// @descripcion: Le pide matrimonio a otro usuario en el grupo. (Uso: /marry @user)

import config from '../../src/lib/config.js';
import { descontarMonedas, obtenerEconomia, query } from '../../src/lib/database.js';
import { extraerMenciones, formatearNumero } from '../../src/lib/utils.js';

// Objeto en memoria para guardar las propuestas pendientes
// key: jidDestino, value: jidOrigen
const proposals = {};

export default async function (m, { conn, text, sender, isGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Los matrimonios son públicos, solo funcionan en grupitos~ 🌸');

  const content = text.trim().toLowerCase();
  const mencionado = extraerMenciones(m)[0];

  // --- Lógica de Aceptar/Rechazar Propuesta ---
  if (content === 'yes' || content === 'aceptar' || content === 'si') {
    const proponente = proposals[sender];
    if (!proponente) {
      return reply('⚠️ *¡Ay!* Nadie te ha propuesto matrimonio recientemente. 💔');
    }

    try {
      // Intentar cobrar el anillo al proponente ANTES de casarlos
      const costoAnillo = 25000;
      await descontarMonedas(proponente, costoAnillo);

      // Si el cobro es exitoso, se casan
      await query(`UPDATE usuarios SET pareja = $1 WHERE jid = $2`, [sender, proponente]);
      await query(`UPDATE usuarios SET pareja = $1 WHERE jid = $2`, [proponente, sender]);

      delete proposals[sender]; // Limpiar propuesta

      let txt = `╭ ꒰ 💍 𝓜𝓪𝓽𝓻𝓲𝓶𝓸𝓷𝓲𝓸 💍 ꒱\n`;
      txt += `┊ ✨ ¡Felicidades a los novios!\n`;
      txt += `┊ 💖 @${proponente.split('@')[0]} y @${sender.split('@')[0]} ahora están casados.\n`;
      txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

      return reply(txt);

    } catch (e) {
      // Si falla el cobro, se cancela la boda
      delete proposals[sender];
      return reply(`❌ *¡Boda cancelada!* @${proponente.split('@')[0]} no tenía suficientes fondos (${formatearNumero(25000)} ${config.economia.monedaEmoji}) para el anillo. 💸`);
    }
  }

  if (content === 'no' || content === 'rechazar') {
    const proponente = proposals[sender];
    if (proponente) {
      delete proposals[sender];
      return reply(`💔 *Oh...* @${sender.split('@')[0]} rechazó la propuesta de @${proponente.split('@')[0]}. Momento incómodo... 🌧️`);
    } else {
      return reply('⚠️ *¡Eh!* No tenías ninguna propuesta pendiente. 👻');
    }
  }

  // --- Lógica para Hacer una Propuesta ---
  if (!mencionado) {
    return reply('⚠️ *¡Ay!* Tienes que mencionar a la persona que amas... o responder `yes/no` a una propuesta.\n`Ejemplo: /marry @user` 🌸');
  }

  if (mencionado === sender) {
    return reply('❌ *¡Baka!* No puedes casarte contigo mismo. 😂');
  }

  try {
    // Comprobar si ya están casados
    const dbS = await query(`SELECT pareja FROM usuarios WHERE jid = $1`, [sender]);
    const dbO = await query(`SELECT pareja FROM usuarios WHERE jid = $1`, [mencionado]);

    if (dbS.rows[0]?.pareja) return reply('🚫 *¡Cuidado!* Ya estás casado/a, no puedes ser infiel aquí. 😠');
    if (dbO.rows[0]?.pareja) return reply(`🚫 *¡Oh oh!* @${mencionado.split('@')[0]} ya tiene el corazón ocupado. 💔`);

    // Verificar si el proponente tiene fondos (sin cobrar)
    const costoAnillo = 25000;
    const economiaProponente = await obtenerEconomia(sender);
    if ((economiaProponente.monedas + economiaProponente.banco) < costoAnillo) {
        return reply(`❌ *Uy...* No tienes suficientes fondos para proponer matrimonio. Necesitas ${formatearNumero(costoAnillo)} ${config.economia.monedaEmoji} para el anillo. 💸`);
    }

    // Guardar la propuesta durante 2 minutos
    proposals[mencionado] = sender;
    setTimeout(() => {
      if (proposals[mencionado] === sender) {
        delete proposals[mencionado];
      }
    }, 50000); // Expiración 50 seg

    let txt = `╭ ꒰ 👩‍❤️‍💋‍👨 𝓟𝓻𝓸𝓹𝓾𝓮𝓼𝓽𝓪 👩‍❤️‍💋‍👨 ꒱\n`;
    txt += `┊ ✨ ¡ALERTA DE AMOR!\n`;
    txt += `┊ 💖 @${sender.split('@')[0]} le propone matrimonio a @${mencionado.split('@')[0]}.\n`;
    txt += `┊ 🔗 Responde con \`/marry yes\` o \`/marry no\`.\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    await conn.sendMessage(m.key.remoteJid, {
      text: txt,
      mentions: [sender, mencionado]
    }, { quoted: m });
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El anillo de compromiso se resbaló y cayó por la alcantarilla.');
  }
}
