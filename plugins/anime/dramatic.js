// @nombre: dramatic
// @alias: drama
// @categoria: anime
// @descripcion: Drama
// @reaccion: 🎭

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'dramatic', ["está haciendo un drama por","es muy dramático con","exagera todo con","montó una escena para","es toda una reina del drama con"]);
}
