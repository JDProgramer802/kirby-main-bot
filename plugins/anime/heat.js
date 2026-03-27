// @nombre: heat
// @categoria: anime
// @descripcion: Tener calor
// @reaccion: 🥵

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'heat', ["tiene mucho calor junto a","se está asando con","necesita aire con","suda la gota gorda con","muere de calor con"]);
}
