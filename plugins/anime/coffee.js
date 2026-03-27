// @nombre: coffee
// @alias: cafe
// @categoria: anime
// @descripcion: Tomar cafe
// @reaccion: ☕

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'coffee', ["está tomando café con","disfruta de un café con","invitó un café a","comparte un momento cafeinado con","se toma un latte con"]);
}
