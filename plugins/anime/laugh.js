// @nombre: laugh
// @categoria: anime
// @descripcion: Reírte
// @reaccion: 😂

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'laugh', ["se está riendo de","se muerde de risa con","no para de reír con","se burla a carcajadas de","muere de la risa con"]);
}
