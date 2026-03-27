// @nombre: warns
// @alias: warns, advertencias
// @categoria: admin
// @descripcion: Revisa cuántas advertencias tiene un usuario

import { extraerMenciones, obtenerCitado } from '../../src/lib/utils.js';
import { query } from '../../src/lib/database.js';

export default async function (m, { isGroup, dbGroup, sender, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  let usuarioObjetivo = extraerMenciones(m)[0];
  const citado = obtenerCitado(m);

  if (!usuarioObjetivo && citado) {
    usuarioObjetivo = citado.jid;
  }

  if (!usuarioObjetivo) {
    usuarioObjetivo = sender; // Si no menciona a nadie, se mira a sí mismo
  }

  try {
    const res = await query(
      `SELECT COUNT(*) as total FROM advertencias WHERE jid_grupo = $1 AND jid_usuario = $2`,
      [m.key.remoteJid, usuarioObjetivo]
    );
    const conteo = parseInt(res.rows[0].total);
    const limite = dbGroup.limite_warns || 3;

    let txt = `╭ ꒰ ⚠️ 𝓐𝓭𝓿𝓮𝓻𝓽𝓮𝓷𝓬𝓲𝓪𝓼 ⚠️ ꒱\n`;
    txt += `┊ 👤 *Usuario:* @${usuarioObjetivo.split('@')[0]}\n`;
    txt += `┊ 🍡 *Acumuladas:* [ ${conteo} / ${limite} ]\n`;
    
    if (conteo === 0) {
      txt += `┊ 🌸 _¡Qué buen angelito!_\n`;
    } else if (conteo < limite) {
      txt += `┊ 🔪 _Pórtate bien o te echo..._\n`;
    }

    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Hubo un error al buscar las advertencias.');
  }
}
