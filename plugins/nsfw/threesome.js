// @nombre: threesome
// @alias: trío, trio
// @categoria: nsfw
// @descripcion: Realizar un trío
// @reaccion: 🥵

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'threesome', ["está haciendo un trío con","se unió a un trío con","armó un trío candente con"]);
}
