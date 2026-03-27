// @nombre: sad
// @alias: triste
// @categoria: anime
// @descripcion: Triste
// @reaccion: 😔

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'sad', ["está triste por","se siente desanimado con","está deprimido por","necesita un abrazo de","está de bajón con"]);
}
