// @nombre: cuddle
// @alias: acurrucarse
// @categoria: anime
// @descripcion: Acurrucarse
// @reaccion: 🤗

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'cuddle', ["se acurrucó con","busca mimos de","está muy pegadito a","se siente seguro con","duerme pegadito a","le encanta estar con"]);
}
