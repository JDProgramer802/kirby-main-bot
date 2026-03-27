// @nombre: kill
// @categoria: anime
// @descripcion: Matar
// @reaccion: 🔪

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'kill', ["mató a","acabó con la vida de","eliminó a","le dio cuello a","lo mandó al lobby a"]);
}
