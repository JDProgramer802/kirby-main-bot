// @nombre: cook
// @categoria: anime
// @descripcion: Cocinar algo delicioso
// @reaccion: 🍳

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'cook', ["está cocinando para","prepara algo rico para","es el chef de","le hizo un banquete a","cocina con amor para"]);
}
