// @nombre: scream
// @categoria: anime
// @descripcion: Gritar
// @reaccion: 🗣️

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'scream', ["le gritó a","perdió los estribos con","le pega un grito a","le reclama a gritos a","está furioso con"]);
}
