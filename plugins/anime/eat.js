// @nombre: eat
// @alias: comer
// @categoria: anime
// @descripcion: Comer algo delicioso
// @reaccion: 🍔

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'eat', ["está comiendo con","devora comida con","disfruta un banquete con","comparte su pizza con","se atiborra de dulces con"]);
}
