// @nombre: walk
// @categoria: anime
// @descripcion: Caminar
// @reaccion: 🚶

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'walk', ["salió a caminar con","pasea junto a","da una vuelta con","camina de la mano de"]);
}
