// @nombre: scared
// @categoria: anime
// @descripcion: Asustado
// @reaccion: 😱

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'scared', ["está muy asustado de","tiembla de miedo ante","tiene pánico por","se esconde de","está aterrado con"]);
}
