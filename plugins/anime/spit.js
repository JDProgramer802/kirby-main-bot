// @nombre: spit
// @alias: escupir
// @categoria: anime
// @descripcion: Escupir
// @reaccion: 💦

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'spit', ["escupió a","le lanzó un gargajo a","despreció a","le mostró su asco a"]);
}
