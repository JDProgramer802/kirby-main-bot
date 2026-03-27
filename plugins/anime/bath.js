// @nombre: bath
// @categoria: anime
// @descripcion: Bañarse
// @reaccion: 🛁

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'bath', ["se está bañando con","toma un baño relajante con","disfruta del agua con","se talla la espalda con","juega con burbujas junto a","se relaja en el jacuzzi con"]);
}
