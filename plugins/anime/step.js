// @nombre: step
// @alias: pisar
// @categoria: anime
// @descripcion: Pisar
// @reaccion: 👢

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'step', ["pisó a","le puso el pie encima a","aplastó a","domina en el suelo a"]);
}
