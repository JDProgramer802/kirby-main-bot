// @nombre: lickass
// @categoria: nsfw
// @descripcion: Lamer culo
// @reaccion: 👅

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'lickass', ["le está lamiendo el culo a","disfruta de su anito con","le chupa el poto a","le limpia el nudo a"]);
}
