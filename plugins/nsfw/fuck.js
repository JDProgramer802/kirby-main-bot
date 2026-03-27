// @nombre: fuck
// @alias: coger
// @categoria: nsfw
// @descripcion: Fuck
// @reaccion: 👉👌

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'fuck', ["se está follando a","se coge a","le da duro a","lo hace con pasión con","le rompe el orto a"]);
}
