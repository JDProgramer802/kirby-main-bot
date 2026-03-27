// @nombre: cold
// @categoria: anime
// @descripcion: Tener frío
// @reaccion: 🥶

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'cold', ["tiene mucho frío junto a","tiembla de frío con","busca calor con","se congela al lado de","necesita una manta con"]);
}
