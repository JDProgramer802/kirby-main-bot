// @nombre: slap
// @alias: bofetada
// @categoria: anime
// @descripcion: Bofetada
// @reaccion: 👋

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'slap', ["le dio una bofetada a","le cruzó la cara a","le soltó una cachetada a","dejó la mano marcada en","le dio un tortazo a"]);
}
