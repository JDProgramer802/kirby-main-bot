// @nombre: grabboobs
// @categoria: nsfw
// @descripcion: Agarrar tetas
// @reaccion: 🍒

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'grabboobs', ["le agarró las tetas a","no suelta los pechos de","manosea las tetas de","estruja los melones de"]);
}
