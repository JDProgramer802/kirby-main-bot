// @nombre: cum
// @categoria: nsfw
// @descripcion: Venirse
// @reaccion: 💦

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'cum', ["se corrió en","acabó dentro de","no aguantó más con","empapó de semen a","se vació en"]);
}
