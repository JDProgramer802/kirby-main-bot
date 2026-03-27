// @nombre: sleep
// @categoria: anime
// @descripcion: Dormir
// @reaccion: 😴

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'sleep', ["se quedó dormido junto a","ronca al lado de","sueña con","toma una siesta con","está en el quinto sueño con"]);
}
