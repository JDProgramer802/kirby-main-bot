// @nombre: botinfo
// @alias: infobot
// @categoria: subbots
// @descripcion: Información técnica del bot actual.
// @reaccion: ℹ️

import os from 'os';

export default async function(m, ctx) {
  const { conn, reply } = ctx;
  
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  const ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
  const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
  
  let txt = `╭┈ ↷\n`;
  txt += `│ 🤖 *${conn.user?.name || 'Kirby Bot'}*\n`;
  txt += `│ 🆔 *JID:* ${conn.user?.id.split(':')[0]}\n`;
  if (conn.user?.lid) txt += `│ 💠 *LID:* ${conn.user.lid.split('@')[0]}\n`;
  txt += `│ ⏳ *Uptime:* ${hours}h ${minutes}m ${seconds}s\n`;
  txt += `│ 🧠 *RAM:* ${ram} MB / ${totalRam} GB\n`;
  txt += `│ 💻 *OS:* ${os.platform()} (${os.release()})\n`;
  txt += `╰─────────────────`;
  
  await reply(txt);
}
