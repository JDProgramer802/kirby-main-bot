// @nombre: kiss
// @alias: beso
// @categoria: anime
// @descripcion: Besar
// @reaccion: 💋

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'kiss', ["le dio un tierno beso a","besó apasionadamente a","le robó un beso a","le dio un beso de amor a","disfruta de los labios de"]);
}
