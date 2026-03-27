// @nombre: lickdick
// @categoria: nsfw
// @descripcion: Lamer pene
// @reaccion: 👅

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'lickdick', ["le está lamiendo el pene a","se lo saborea a","chupa suavemente el palo de","disfruta de la cabecita de"]);
}
