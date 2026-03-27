// @nombre: handjob
// @categoria: nsfw
// @descripcion: Paja
// @reaccion: 🖐️

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'handjob', ["le está haciendo una paja a","le menea el palo a","usa sus manos con","le da un pajazo a"]);
}
