// @nombre: solo
// @alias: dedear, fap
// @categoria: nsfw
// @descripcion: Masturbarse (Solo)
// @reaccion: 🥵

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'solo', ["se está masturbando","está disfrutando a solas","se está dando mucho autoplacer"]);
}
