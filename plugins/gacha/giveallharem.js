// @nombre: giveallharem
// @alias: giveallharem, regalarharem
// @categoria: gacha
// @descripcion: Transfiere TODO tu harem a otro usuario. (Peligroso)

import { query } from '../../src/lib/database.js';
import { extraerMenciones, obtenerCitado } from '../../src/lib/utils.js';

export default async function (m, { sender, isGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  let usuarioObjetivo = extraerMenciones(m)[0];
  const citado = obtenerCitado(m);
  if (!usuarioObjetivo && citado) usuarioObjetivo = citado.jid;

  if (!usuarioObjetivo) {
    return reply('⚠️ *¡Ay!* Menciona al suertudo que se quedará con todas tus waifus.\n`Ejemplo: /giveallharem @user` 🌸');
  }

  if (usuarioObjetivo === sender) {
    return reply('❌ *Eh...* No puedes regalarte tu propio harem a ti mismo. 🥺');
  }

  try {
    const res = await query(`SELECT COUNT(id) as total FROM harem WHERE jid_usuario = $1`, [sender]);
    const total = parseInt(res.rows[0].total);

    if (total === 0) {
      return reply('❌ *Aww...* Pero si no tienes a nadie en tu harem... ¿qué ibas a regalar? 😿');
    }

    // Transferir todo en lote
    await query(`UPDATE harem SET jid_usuario = $1 WHERE jid_usuario = $2`, [usuarioObjetivo, sender]);

    let txt = `╭ ꒰ 🎁 𝓜𝓮𝓰𝓪 𝓡𝓮𝓰𝓪𝓵𝓸 🎁 ꒱\n`;
    txt += `┊ ✨ ¡Qué locura!\n`;
    txt += `┊ 💖 @${sender.split('@')[0]} le regaló su harem ENTERO (${total} personajes) a @${usuarioObjetivo.split('@')[0]}.\n`;
    txt += `┊ 🌸 _Esa es verdadera amistad..._\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Oh no...* Tanta felicidad saturó el servidor. El regalo falló.');
  }
}
