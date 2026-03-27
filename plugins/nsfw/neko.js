// @nombre: nekonfw
// @alias: nekohentai
// @categoria: nsfw
// @descripcion: Contenido NSFW: Neko.
// @reaccion: 🐱

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'neko', 'le muestra su lado neko a');
}
