// @nombre: dance
// @alias: bailar
// @categoria: anime
// @descripcion: Bailar
// @reaccion: 💃

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'dance', ["está bailando con","saca sus mejores pasos con","disfruta del ritmo con","mueve el cuerpo con","baila toda la noche con"]);
}
