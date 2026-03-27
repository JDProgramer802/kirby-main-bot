// @nombre: angry
// @alias: enojado
// @categoria: anime
// @descripcion: Estar enojado
// @reaccion: 😡

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'angry', ["está muy enojado con","se enfureció con","está molesto con","le lanza una mirada letal a","no quiere ver ni en pintura a","le hace un berrinche a"]);
}
