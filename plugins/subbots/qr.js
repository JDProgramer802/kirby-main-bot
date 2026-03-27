// @nombre: qr
// @alias: serbot, jadibot, qrpremium, qrtemporal
// @categoria: subbots
// @descripcion: Vincular un sub-bot mediante código QR.
// @reaccion: 🤖

import { subbotManager } from '../../src/lib/subbotManager.js';
import { toBoldSerif, toSmallCaps } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  const { sender, reply } = ctx;

  const msg = `╭┈ ↷  *『 🤖 𝓢𝓾𝓫-𝓑𝓸𝓽 𝓠𝓡 』*
│
│ 🎀 *${toBoldSerif('¡Hola poyo!')}*
│ ⏳ Generando tu código QR...
│
│ 🌸 *${toSmallCaps('instrucciones')}*
│ 1. Ve a *Dispositivos vinculados*.
│ 2. Escanea el QR que enviaré abajo.
│ 3. ¡Listo! Serás parte de Dreamland.
│
╰───────────────── ✨`;

  await reply(msg);

  const result = await subbotManager.conectar(sender, m, false);

  if (result && !result.success && result.message) {
    await reply(`❌ *¡Ay!* ${result.message}`);
  }
}
