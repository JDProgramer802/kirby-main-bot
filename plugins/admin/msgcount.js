// @nombre: msgcount
// @alias: msgcount, mensajes, stats
// @categoria: admin
// @descripcion: Muestra cuántos mensajes ha enviado un usuario (o varios) en el grupo

import { query } from '../../src/lib/database.js';
import { extraerMenciones, obtenerCitado } from '../../src/lib/utils.js';

export default async function (m, { isGroup, sender, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  const menciones = extraerMenciones(m);

  if (menciones && menciones.length > 0) {
    try {
      const resultados = [];
      for (const jid of menciones) {
        const res = await query(
          `SELECT cantidad FROM mensajes_grupo WHERE jid_grupo = $1 AND jid_usuario = $2`,
          [m.key.remoteJid, jid]
        );
        const cantidad = res.rows[0] ? res.rows[0].cantidad : 0;
        resultados.push({ jid, cantidad });
      }

      let txt = `╭ ꒰ 💬 𝓒𝓸𝓷𝓽𝓪𝓭𝓸𝓻 𝓭𝓮 𝓜𝓮𝓷𝓼𝓪𝓳𝓮𝓼 💬 ꒱\n`;
      for (const r of resultados) {
        txt += `┊ 👤 *Usuario:* @${r.jid.split('@')[0]}\n`;
        txt += `┊ 🍡 *Mensajes enviados:* ${r.cantidad}\n`;
        if (r.cantidad === 0) txt += `┊ 👻 _¡Es un fantasmita!_\n`;
        txt += `┊ \n`;
      }
      txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

      const mentions = resultados.map(r => r.jid);
      return reply(txt, { mentions });
    } catch (err) {
      console.error(err);
      return reply('❌ *Aww...* Hubo un error al buscar los mensajes.');
    }
  }

  let usuarioObjetivo = null;
  const citado = obtenerCitado(m);
  if (!usuarioObjetivo && citado) usuarioObjetivo = citado.jid;
  if (!usuarioObjetivo) usuarioObjetivo = sender;

  try {
    const res = await query(
      `SELECT cantidad FROM mensajes_grupo WHERE jid_grupo = $1 AND jid_usuario = $2`,
      [m.key.remoteJid, usuarioObjetivo]
    );

    const cantidad = res.rows[0] ? res.rows[0].cantidad : 0;

    let txt = `╭ ꒰ 💬 𝓒𝓸𝓷𝓽𝓪𝓭𝓸𝓻 𝓭𝓮 𝓜𝓮𝓷𝓼𝓪𝓳𝓮𝓼 💬 ꒱\n`;
    txt += `┊ 👤 *Usuario:* @${usuarioObjetivo.split('@')[0]}\n`;
    txt += `┊ 🍡 *Mensajes enviados:* ${cantidad}\n`;
    if (cantidad === 0) txt += `┊ 👻 _¡Es un fantasmita!_\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Hubo un error al buscar los mensajes.');
  }
}
