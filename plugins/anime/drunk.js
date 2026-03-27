// @nombre: drunk
// @categoria: anime
// @descripcion: Estar borracho
// @reaccion: 🍺

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'drunk', ["está muy borracho con","bebió de más con","está ebrio junto a","ve doble a","no puede ni caminar con"]);
}
