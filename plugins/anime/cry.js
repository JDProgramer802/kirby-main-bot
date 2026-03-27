// @nombre: cry
// @categoria: anime
// @descripcion: Llorar por algo o alguien
// @reaccion: 😭

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'cry', ["está llorando por","derrama lágrimas por","está muy triste por","necesita un consuelo de","se desahoga con"]);
}
