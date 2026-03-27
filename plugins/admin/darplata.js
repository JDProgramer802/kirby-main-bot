// @nombre: darplata
// @alias: addmoney, darplata, generardinero
// @categoria: admin
// @descripcion: Genera dinero para un usuario mencionado o citado (solo admins).
// @reaccion: 💰

import { actualizarBanco, obtenerEconomia } from '../../src/lib/database.js';
import { extraerMenciones, formatearMonedas, log, obtenerCitado } from '../../src/lib/utils.js';

export default async function (m, { conn, isGroup, isOwner, args, reply, sender }) {
  // 1. Identificar si el que envía es administrador
  let senderIsAdmin = false;

  if (isGroup) {
    try {
      const metadata = await conn.groupMetadata(m.key.remoteJid);
      const participant = metadata.participants.find(p => p.id === sender);
      senderIsAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin' || isOwner;
    } catch (e) {
      log('ERROR', `Error al obtener metadata en darplata: ${e.message}`);
      // Si falla, solo permitimos al dueño como fallback
      senderIsAdmin = isOwner;
    }
  } else {
    // En privado solo el dueño puede generar dinero
    senderIsAdmin = isOwner;
  }

  if (!senderIsAdmin) return reply('❌ *¡Poyo!* Solo los administradores pueden generar dinero mijo.');

  // 2. Identificar al destinatario y la cantidad
  let target = extraerMenciones(m)[0];
  let amount = 0;
  let amountStr = '';

  if (target) {
    // Si hay mención, la cantidad es el primer número que no sea parte de la mención
    amountStr = args.find(a => /^\d+$/.test(a) && !(m.text || '').includes(a));
  } else {
    // Si no hay mención, buscar un LID o un citado
    const citado = obtenerCitado(m);
    if (citado) {
      target = citado.jid;
      amountStr = args.find(a => /^\d+$/.test(a));
    } else {
      // Buscar un LID en los argumentos
      const lidMatch = args.find(a => /^@?\d+@(s\.whatsapp\.net|lid)$/.test(a));
      if (lidMatch) {
        target = lidMatch.replace('@', '');
        amountStr = args.find(a => /^\d+$/.test(a) && a !== lidMatch);
      }
    }
  }

  amount = parseInt(amountStr);

  if (!target || !amountStr || isNaN(amount) || amount <= 0) {
    return reply('⚠️ *¡Poyo!* Uso incorrecto.\n*Ejemplo:* `/darplata @user 500` o `/darplata 57...@s.whatsapp.net 500`');
  }

  try {
    // 4. Generar el dinero (directamente al banco)
    await actualizarBanco(target, amount);

    // Obtener balance actualizado para mostrarlo enseguida
    const economiaActualizada = await obtenerEconomia(target);
    const balanceTotal = formatearMonedas(Number(economiaActualizada.monedas) + Number(economiaActualizada.banco));

    const formatted = formatearMonedas(amount);
    const targetNumber = target.split('@')[0];

    let txt = `╭ ꒰ 💰 𝓡𝓮𝓰𝓪𝓵𝓸 𝓭𝓮𝓵 𝓑𝓸𝓽 💰 ꒱\n`;
    txt += `┊ ✨ ¡Se han generado monedas mágicas!\n`;
    txt += `┊ 👤 *Para:* @${targetNumber}\n`;
    txt += `┊ 💵 *Cantidad:* +${formatted}\n`;
    txt += `┊ 🏦 *Balance Total:* ${balanceTotal}\n`;
    txt += `┊ 🌸 _¡Disfrútalo, parce!_\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    await conn.sendMessage(m.key.remoteJid, {
      text: txt,
      mentions: [target]
    }, { quoted: m });

    log('OK', `Admin ${sender.split('@')[0]} generó ${amount} para ${targetNumber}`);

  } catch (err) {
    log('ERROR', `Error en darplata: ${err.message}`);
    reply('❌ *Oh no...* Hubo un problema al generar el dinero. Inténtalo más tarde.');
  }
}
