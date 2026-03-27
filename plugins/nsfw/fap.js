// @nombre: fap
// @alias: paja
// @categoria: nsfw
// @descripcion: Fap
// @reaccion: 🍆

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'fap', ["se está haciendo una paja pensando en","se masturba por","le dedica una paja a","se manosea por culpa de"]);
}
