// @nombre: love
// @alias: amor
// @categoria: anime
// @descripcion: Amor
// @reaccion: ❤️

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'love', ["siente mucho amor por","está enamorado de","ama profundamente a","daría la vida por","está loquito por"]);
}
