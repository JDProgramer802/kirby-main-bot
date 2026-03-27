// @nombre: blowjob
// @alias: mamada, bj
// @categoria: nsfw
// @descripcion: Mamada
// @reaccion: 🔞

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'blowjob', ["le está haciendo una mamada a","se la chupa a","disfruta del sabor de","le limpia el palo a","se atraganta con la leche de"]);
}
