// @nombre: sixnine
// @alias: 69
// @categoria: nsfw
// @descripcion: 69
// @reaccion: ♋

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'sixnine', ["hizo un 69 con","está en un 69 con","se saborean mutuamente en un 69 con","se chupan todo en el 69 con"]);
}
