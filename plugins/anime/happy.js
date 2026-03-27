// @nombre: happy
// @alias: feliz
// @categoria: anime
// @descripcion: Salta de felicidad
// @reaccion: 😁

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'happy', ["está muy feliz con","salta de alegría por","irradia felicidad con","está de lo más contento con","sonríe de oreja a oreja por"]);
}
