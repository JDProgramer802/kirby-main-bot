// @nombre: pat
// @alias: caricia
// @categoria: anime
// @descripcion: Acariciar
// @reaccion: ✨

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'pat', ["acarició suavemente a","le dio palmaditas a","consiente a","le hace piojito a","mima la cabeza de"]);
}
