// @nombre: poke
// @alias: picar
// @categoria: anime
// @descripcion: Picar
// @reaccion: 👉

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'poke', ["le picó la mejilla a","está molestando a","le pica a","no deja de picar a","provoca a"]);
}
