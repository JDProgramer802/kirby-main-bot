// @nombre: hug
// @alias: abrazo
// @categoria: anime
// @descripcion: Abrazar
// @reaccion: 🫂

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'hug', ["le dio un gran abrazo a","abraza fuertemente a","le dio un abrazo cálido a","necesita un abrazo de","le da un abrazo de oso a","se aferra en un abrazo a"]);
}
