// @nombre: cumshot
// @categoria: nsfw
// @descripcion: Disparar semen
// @reaccion: 💦

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'cumshot', ["le dio un cumshot a","le disparó su leche a","bañó en semen a","le hizo un facial a"]);
}
