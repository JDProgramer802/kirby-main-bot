// @nombre: logout
// @alias: salir, stopbot
// @categoria: subbots
// @descripcion: Cerrar sesión del sub-bot.
// @reaccion: 👋

import { subbotManager } from '../../src/lib/subbotManager.js';

export default async function(m, ctx) {
  const { sender, reply } = ctx;
  
  const ok = await subbotManager.logout(sender);
  
  if (ok) {
    await reply('✅ *Sesión cerrada exitosamente.*');
  } else {
    await reply('❌ *No tienes una sesión activa para cerrar.*');
  }
}
