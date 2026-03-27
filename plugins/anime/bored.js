// @nombre: bored
// @alias: aburrido
// @categoria: anime
// @descripcion: Estar aburrido
// @reaccion: 🥱

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'bored', ["está aburrido con","no tiene nada que hacer con","se bosteza junto a","necesita algo de acción con","se siente ignorado por"]);
}
