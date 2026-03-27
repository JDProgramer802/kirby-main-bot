// @nombre: harem
// @alias: harem, coleccion, waifus
// @categoria: gacha
// @descripcion: Muestra la lista de personajes obtenidos

import { query } from '../../src/lib/database.js';
import { extraerMenciones, obtenerCitado } from '../../src/lib/utils.js';

export default async function (m, { sender, reply }) {
  let objetivo = extraerMenciones(m)[0];
  const citado = obtenerCitado(m);

  if (!objetivo && citado) {
    objetivo = citado.jid;
  }
  if (!objetivo) objetivo = sender;

  try {
    const res = await query(
      `SELECT p.nombre, p.rareza, p.serie, h.favorito 
       FROM harem h
       JOIN personajes_disponibles p ON h.personaje_id = p.id
       WHERE h.jid_usuario = $1
       ORDER BY p.rareza DESC, p.nombre ASC`,
      [objetivo]
    );

    if (res.rows.length === 0) {
      return reply(objetivo === sender 
        ? '⚠️ *¡Aww!* Aún no tienes a nadie en tu harem. Usa `/roll` y `/claim` para empezar. 🌸'
        : '⚠️ Este amiguito no tiene a nadie en su harem todavía.');
    }

    let favoritas = res.rows.filter(r => r.favorito);
    let normales = res.rows.filter(r => !r.favorito);
    
    // Unimos poner las favoritas arriba
    let listaF = favoritas.map(p => `☆ ${p.nombre} [${'⭐'.repeat(p.rareza)}] (💖)`);
    let listaN = normales.map(p => `☆ ${p.nombre} [${'⭐'.repeat(p.rareza)}]`);
    let coleccion = [...listaF, ...listaN];

    // Paginación simple (mostrar los primeros 15)
    const mostrar = coleccion.slice(0, 15);
    const extra = coleccion.length - 15;

    let txt = `╭ ꒰ 💖 𝓗𝓪𝓻𝓮𝓶 𝓚𝓪𝔀𝓪𝓲𝓲 💖 ꒱\n`;
    txt += `┊ 👤 *Propietario:* @${objetivo.split('@')[0]}\n`;
    txt += `┊ 🎴 *Total personajes:* ${res.rows.length}\n`;
    txt += `┊ \n`;
    
    mostrar.forEach(c => {
      txt += `┊ ${c}\n`;
    });

    if (extra > 0) {
      txt += `┊ \n┊ ...y ${extra} más escondidos~ \n`;
    }
    
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    // Si queremos que etiquete, podríamos usar mentions, pero por legibilidad lo omitimos y que quede solo visual
    reply(txt);

  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Hubo un error al cargar el harem.');
  }
}
