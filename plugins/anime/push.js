// @nombre: push
// @categoria: anime
// @descripcion: Empujar
// @reaccion: 🤚

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'push', ["empujó a","alejó a","le dio un empujón a","le hace el feo a","quita de su camino a"]);
}
