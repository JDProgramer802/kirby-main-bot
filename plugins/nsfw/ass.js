// @nombre: ass
// @alias: poto
// @categoria: nsfw
// @descripcion: Trasero
// @reaccion: 🍑

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'ass', ["le muestra su trasero a","se menea para","le enseña el culo a","le da nalgadas a","pone su culito frente a"]);
}
