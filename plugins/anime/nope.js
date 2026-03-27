// @nombre: nope
// @categoria: anime
// @descripcion: Negarse
// @reaccion: 🙅

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'nope', ["se negó contundentemente con","dijo que no a","rechazó a","le hizo la ley del hielo a","no está de acuerdo con"]);
}
