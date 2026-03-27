// @nombre: packlist
// @alias: packlist, mispaquetes, listapacks
// @categoria: stickers
// @descripcion: Lista tus paquetes de stickers creados o los de otra persona. (Uso: /packlist [@user])

import { query } from '../../src/lib/database.js';
import { extraerMenciones } from '../../src/lib/utils.js';

export default async function (m, { sender, reply }) {
  let objetivo = extraerMenciones(m)[0] || sender;

  try {
    const res = await query(
      `SELECT p.id, p.nombre, p.publico, p.descripcion, COUNT(s.id) as num_stickers 
       FROM packs_stickers p 
       LEFT JOIN stickers_items s ON p.id = s.pack_id 
       WHERE p.jid_creador = $1 
       GROUP BY p.id 
       ORDER BY p.fecha_creacion ASC`,
      [objetivo]
    );

    if (res.rows.length === 0) {
      if (objetivo === sender) {
        return reply('⚠️ *Aww...* Todavía no has creado ningún paquete. Usa `/newpack [nombre]` 🌸');
      } else {
        return reply('⚠️ Ese amiguito no tiene ningún paquete creado. 😿');
      }
    }

    let txt = `╭ ꒰ 📦 𝓟𝓪𝓺𝓾𝓮𝓽𝓮𝓼 𝓭𝓮 𝓢𝓽𝓲𝓬𝓴𝓮𝓻𝓼 📦 ꒱\n`;
    txt += `┊ 👤 *Propietario:* @${objetivo.split('@')[0]}\n`;
    
    res.rows.forEach(p => {
      let visibilidad = p.publico ? '🌍 Global' : '🔒 Privado';
      let descripcion = p.descripcion || 'Sin descripción';
      txt += `┊ 🎨 *${p.nombre}* [${p.num_stickers} pegatinas] - _${visibilidad}_\n`;
      txt += `┊ 📝 ${descripcion}\n`;
    });
    
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Los estantes de paquetes se derrumbaron.');
  }
}
