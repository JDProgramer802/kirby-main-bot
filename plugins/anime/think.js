// @nombre: think
// @categoria: anime
// @descripcion: Pensar
// @reaccion: 🤔

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'think', ["está pensando profundamente en","reflexiona sobre","tiene dudas sobre","está ideando un plan con"]);
}
