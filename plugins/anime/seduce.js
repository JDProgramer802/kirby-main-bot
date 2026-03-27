// @nombre: seduce
// @categoria: anime
// @descripcion: Seducir
// @reaccion: 😍

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'seduce', ["está seduciendo a","coquetea con","intenta conquistar a","le lanza el perro a","está de casanova con"]);
}
