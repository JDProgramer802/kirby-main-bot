// @nombre: bleh
// @categoria: anime
// @descripcion: Sacar la lengua
// @reaccion: 😛

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'bleh', ["le sacó la lengua a","le hace burla a","se burla de","le hace una mueca a","se ríe en la cara de"]);
}
