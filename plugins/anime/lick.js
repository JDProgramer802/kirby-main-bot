// @nombre: lick
// @categoria: anime
// @descripcion: Lamer
// @reaccion: 👅

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'lick', ["lamió a","le dio una lamiada a","saboreó a","le pasa la lengua a","disfruta el sabor de"]);
}
