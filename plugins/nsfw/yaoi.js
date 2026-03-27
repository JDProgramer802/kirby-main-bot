// @nombre: yaoi
// @alias: yaoi
// @categoria: nsfw
// @descripcion: Acción yaoi
// @reaccion: 👬

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'yaoi', ["está teniendo acción pura con","se está divirtiendo duro con","tiene una sesión intensa con"]);
}
