// @nombre: cummouth
// @categoria: nsfw
// @descripcion: Acabar boca
// @reaccion: 👄

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'cummouth', ["acabó en la boca de","le llenó la boca a","le dio leche de beber a","le hizo tragar todo a"]);
}
