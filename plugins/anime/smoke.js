// @nombre: smoke
// @categoria: anime
// @descripcion: Fumar
// @reaccion: 🚬

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'smoke', ["está fumando con","prende un cigarrillo con","está relajado con","comparte un puro con","lanza humo a"]);
}
