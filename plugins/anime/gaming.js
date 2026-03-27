// @nombre: gaming
// @categoria: anime
// @descripcion: Jugar videojuegos
// @reaccion: 🎮

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'gaming', ["está jugando videojuegos con","le gana en el juego a","está viciado con","hace un stream con","juega una partida épica con"]);
}
