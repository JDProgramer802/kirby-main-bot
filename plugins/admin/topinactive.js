// @nombre: topinactive
// @alias: topinactive, fantasmas
// @categoria: admin
// @descripcion: Muestra los usuarios con menos mensajes (o 0) en el grupo (o de menciones)

import { query } from '../../src/lib/database.js';
import { extraerMenciones } from '../../src/lib/utils.js';

export default async function (m, { conn, isGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  try {
    const menciones = extraerMenciones(m);

    if (menciones && menciones.length > 0) {
      const resultados = [];
      for (const jid of menciones) {
        const r = await query(
          `SELECT cantidad FROM mensajes_grupo WHERE jid_grupo = $1 AND jid_usuario = $2`,
          [m.key.remoteJid, jid]
        );
        resultados.push({
          jid,
          cantidad: r.rows[0] ? r.rows[0].cantidad : 0
        });
      }

      resultados.sort((a, b) => a.cantidad - b.cantidad);

      let txt = `╭ ꒰ 👻 𝓕𝓪𝓷𝓽𝓪𝓼𝓶𝓲𝓽𝓸𝓼 (Menciones) 👻 ꒱\n`;
      resultados.forEach(row => {
        txt += `┊ 🕷️ *@${row.jid.split('@')[0]}* (${row.cantidad} msj)\n`;
      });
      txt += `╰━━━━━━━━━━━━━━━━━ 💔`;

      return reply(txt, { mentions: resultados.map(r => r.jid) });
    }

    const res = await query(
      `SELECT jid_usuario, cantidad FROM mensajes_grupo
       WHERE jid_grupo = $1 ORDER BY cantidad ASC LIMIT 10`,
      [m.key.remoteJid]
    );

    const metadata = await conn.groupMetadata(m.key.remoteJid);
    const inDB = res.rows.map(r => r.jid_usuario);
    const fantasmasReales = metadata.participants
      .filter(p => !inDB.includes(p.id))
      .slice(0, 10);

    let txt = `╭ ꒰ 👻 𝓣𝓸𝓹 𝓕𝓪𝓷𝓽𝓪𝓼𝓶𝓪𝓼 👻 ꒱\n`;

    const mentions = [];
    let cont = 1;
    for (const f of fantasmasReales) {
      txt += `┊ 🕷️ *@${f.id.split('@')[0]}* (0 msj)\n`;
      mentions.push(f.id);
      cont++;
      if (cont > 5) break;
    }

    for (const row of res.rows) {
      if (cont > 10) break;
      txt += `┊ 🕸️ *@${row.jid_usuario.split('@')[0]}* (${row.cantidad} msj)\n`;
      mentions.push(row.jid_usuario);
      cont++;
    }

    txt += `╰━━━━━━━━━━━━━━━━━ 💔`;

    reply(txt, { mentions });
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Hubo un error al cargar los fantasmitas.');
  }
}
