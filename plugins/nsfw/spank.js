// @nombre: spank
// @alias: nalgada
// @categoria: nsfw
// @descripcion: Spank
// @reaccion: 👋

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'spank', ["le dio una nalgada a","le azotó el culo a","le dejó la marca a","le pone el poto rojo a"]);
}
