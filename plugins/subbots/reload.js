// @nombre: reload
// @alias: reiniciar
// @categoria: subbots
// @descripcion: Recargar la sesión del bot.
// @reaccion: 🔄

import { subbotManager } from '../../src/lib/subbotManager.js';

export default async function(m, ctx) {
  const { sender, reply } = ctx;
  
  await reply('🔄 *Reiniciando sesión...* por favor espera.');
  
  await subbotManager.logout(sender);
  const result = await subbotManager.conectar(sender);
  
  if (result.conn) {
    await reply('✅ *Sesión reiniciada correctamente.*');
  } else {
    await reply('❌ *Error al reiniciar la sesión.*');
  }
}
