// @nombre: code
// @alias: codigo, vincular
// @categoria: subbots
// @descripcion: Vincula un subbot usando código Pairing (sin QR).
// @reaccion: 📱

import { subbotManager } from '../../src/lib/subbotManager.js';
import { toBoldSerif, toSmallCaps } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  const { reply, args, conn } = ctx;

  const inputNumber = args[0]?.replace(/\D/g, '');

  if (!inputNumber || inputNumber.length < 8) {
    return reply(
      `╭┈ ↷  *『 📱 𝓒𝓸𝓭𝓲𝓰𝓸 𝓟𝓪𝓲𝓻𝓲𝓷𝓰 』*\n` +
      `│\n` +
      `│ 🎀 *${toBoldSerif('¡Hola poyo!')}*\n` +
      `│ Necesitas darme un número válido.\n` +
      `│\n` +
      `│ 🌸 *${toSmallCaps('uso correcto')}*\n` +
      `│ \`/code 5491122334455\`\n` +
      `│\n` +
      `│ 💡 Incluye el código de país sin el +\n` +
      `╰───────────────── ✨`
    );
  }

  const sessionId = `${inputNumber}@s.whatsapp.net`;

  if (subbotManager.instances.has(sessionId)) {
    const existing = subbotManager.instances.get(sessionId);
    if (existing?.authState?.creds?.registered) {
      return reply(`⚠️ El número *+${inputNumber}* ya está conectado como sub-bot.`);
    }
    subbotManager.instances.delete(sessionId);
  }

  await reply(
    `╭┈ ↷  *『 📱 𝓒𝓸𝓭𝓲𝓰𝓸 𝓟𝓪𝓲𝓻𝓲𝓷𝓰 』*\n` +
    `│\n` +
    `│ 🎀 *${toBoldSerif('¡Perfecto poyo!')}*\n` +
    `│ Número: *+${inputNumber}*\n` +
    `│ ⏳ Generando código, espera un momento...\n` +
    `│\n` +
    `│ 🌸 *${toSmallCaps('instrucciones')}*\n` +
    `│  1. Abre WhatsApp → *Dispositivos vinculados*\n` +
    `│  2. Toca *Vincular con número de teléfono*\n` +
    `│  3. Ingresa el código que llegará abajo\n` +
    `│  ⏰ Tienes ~60 segundos para usarlo\n` +
    `╰───────────────── ✨`
  );

  try {
    // Si tenemos una instancia de subbots separada, delegamos la conexión allí
    if (conn.subbotProcess) {
      conn.subbotProcess.send({
        type: 'connect',
        jid: sessionId,
        pairing: true,
        responseInfo: {
          remoteJid: m.key.remoteJid,
          key: m.key,
          ownerJid: m.sender
        }
      });
    } else {
      // Fallback por si acaso
      await subbotManager.conectar(sessionId, m, true, 0, conn);
    }
  } catch (e) {
    console.error('[/code] Error:', e);
    await reply(
      `❌ *¡Oops!* No pude generar el código.\n` +
      `_${e.message}_\n\n` +
      `Intenta de nuevo en unos segundos.`
    );
  }
}
