// @nombre: bite
// @categoria: anime
// @descripcion: Muerde a alguien
// @reaccion: 🧛

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'bite', ["mordió a","le dio un mordisquito a","clavo sus dientes en","le dio una mordida juguetona a","le marcó los dientes a","muerde cariñosamente a"]);
}
