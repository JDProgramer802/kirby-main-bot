// @nombre: yuri
// @alias: tijeras
// @categoria: nsfw
// @descripcion: Yuri
// @reaccion: ✂️

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'yuri', ["está tijereando con","hace tijeras con","disfruta de su feminidad con","se frota las almejas con"]);
}
