// @nombre: tickle
// @categoria: anime
// @descripcion: Cosquillas
// @reaccion: 🤣

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'tickle', ["le hizo cosquillas a","no para de hacerle mimos a","muere de risa haciéndole cosquillas a","le tortura con risas a"]);
}
