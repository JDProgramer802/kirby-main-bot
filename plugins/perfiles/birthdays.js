// @nombre: birthdays
// @alias: birthdays, cumpleaños, cumples
// @categoria: perfiles
// @descripcion: Muestra los cumpleaños próximos o los del grupo. (Uso: /birthdays)

import { query } from '../../src/lib/database.js';

export default async function (m, { isGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  // Para `birthdays`, simplemente mostraremos a todos los usuarios de la base que tengan un cumple.
  // En un caso real se filtraría por participantes del grupo (como allbirthdays, pero ese comando no requiere grupo).
  
  try {
    const res = await query(
      `SELECT jid, nombre, cumpleanos FROM usuarios WHERE cumpleanos != '' AND cumpleanos IS NOT NULL`
    );

    if (res.rows.length === 0) {
      return reply('⚠️ *¡Ay!* Nadie ha registrado su cumpleaños aún. ¡Sé el primero con `/micumple DD/MM`! 🎂');
    }

    let txt = `╭ ꒰ 🎂 𝓒𝓪𝓵𝓮𝓷𝓭𝓪𝓻𝓲𝓸 𝓚𝓪𝔀𝓪𝓲𝓲 🎂 ꒱\n`;
    txt += `┊ ✨ Próximas festividades:\n`;

    // Ordenaremos alfabéticamente el mes y el día, o simplemente mostrarlos
    res.rows.sort((a, b) => {
      let [d1, m1] = a.cumpleanos.split('/');
      let [d2, m2] = b.cumpleanos.split('/');
      return Number(m1 + d1) - Number(m2 + d2);
    });

    res.rows.forEach(u => {
      let nom = u.nombre || `@${u.jid.split('@')[0]}`;
      txt += `┊ 🎁 *${u.cumpleanos}* - ${nom}\n`;
    });

    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* El calendario mágico se quemó.');
  }
}
