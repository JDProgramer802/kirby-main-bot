// @nombre: status
// @categoria: utilidad
// @descripcion: Ver estado del bot
// @reaccion: 📊

import { subbotManager } from '../../src/lib/subbotManager.js';
import { kirbyBox, separador } from '../../src/lib/utils.js';

function formatBytes(bytes) {
  const unidades = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < unidades.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${unidades[i]}`;
}

export default async function(m, { reply }) {
  const uptime = process.uptime();
  const memory = process.memoryUsage();

  const msg = `📊 *Estado del Bot*\n${separador()}\n`
    + `• Uptime: *${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s*\n`
    + `• Bots activos: *${1 + subbotManager.instances.size}* (Principal + *${subbotManager.instances.size}* subbots)\n${separador()}\n`
    + `📌 *Memoria*\n`
    + `• RSS: *${formatBytes(memory.rss)}*\n`
    + `• Heap total: *${formatBytes(memory.heapTotal)}*\n`
    + `• Heap usado: *${formatBytes(memory.heapUsed)}*\n`
    + `• External: *${formatBytes(memory.external)}*`;

  await reply(kirbyBox(msg, '📈 Status'));
}
