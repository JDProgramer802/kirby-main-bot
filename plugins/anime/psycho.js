// @nombre: psycho
// @categoria: anime
// @descripcion: Psicópata
// @reaccion: 👹

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'psycho', ["se volvió psicópata con","tiene una mirada aterradora para","está loco por","le da miedo a","perdió la razón con"]);
}
