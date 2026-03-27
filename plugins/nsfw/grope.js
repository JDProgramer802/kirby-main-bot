// @nombre: grope
// @categoria: nsfw
// @descripcion: Manosear
// @reaccion: 🖐️

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'grope', ["manoseó a","está explorando el cuerpo de","no puede dejar de tocar a","le mete mano a"]);
}
