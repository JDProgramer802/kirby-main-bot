// @nombre: lewd
// @categoria: anime
// @descripcion: Lascivo
// @reaccion: 😏

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'lewd', ["tiene pensamientos lascivos con","mira pícaramente a","está muy pervertido con","quiere hacer cosas sucias con","le lanza una mirada hot a"]);
}
