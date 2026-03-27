// @nombre: pout
// @categoria: anime
// @descripcion: Pucheros
// @reaccion: 😤

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'pout', ["le hace pucheros a","se puso caprichoso con","está muy molesto con","le hace un gesto tierno a","se enfunó con"]);
}
