// @nombre: autojoin
// @alias: autounirse
// @categoria: subbots
// @descripcion: Activar/Desactivar unión automática a grupos (solo para el dueño).
// @reaccion: 🚪

import { setBotConfig, getBotConfig } from '../../src/lib/database.js';

export default async function(m, ctx) {
  const { text, reply, isOwner } = ctx;
  
  if (!isOwner) return reply('❌ *Solo el dueño del bot puede configurar el autojoin.*');
  
  const enable = text.toLowerCase() === 'enable' || text.toLowerCase() === 'on';
  const disable = text.toLowerCase() === 'disable' || text.toLowerCase() === 'off';
  
  if (!enable && !disable) return reply('❌ *Uso: #autojoin [enable/disable]*');
  
  await setBotConfig('autojoin', enable ? 'on' : 'off');
  await reply(`✅ *Autojoin configurado como:* ${enable ? 'ACTIVADO' : 'DESACTIVADO'}`);
}
