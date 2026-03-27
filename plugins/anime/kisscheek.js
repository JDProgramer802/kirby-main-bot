// @nombre: kisscheek
// @alias: beso
// @categoria: anime
// @descripcion: Beso en la mejilla
// @reaccion: 😘

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'kiss', ["le dio un beso en la mejilla a","saluda con un beso a","le dio un besito a","mima con un beso a"]);
}
