// @nombre: draw
// @categoria: anime
// @descripcion: Dibujar
// @reaccion: 🎨

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'draw', ["dibujó a","hizo un retrato de","retrató a","hizo un boceto de","pinta una obra de arte de"]);
}
