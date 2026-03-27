// @nombre: jump
// @categoria: anime
// @descripcion: Saltar
// @reaccion: 🦘

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'jump', ["saltó sobre","está brincando con","salta de emoción con","brinca como loco por","le dio un salto a"]);
}
