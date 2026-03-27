// @nombre: punch
// @categoria: anime
// @descripcion: Puñetazo
// @reaccion: 👊

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'punch', ["le dio un puñetazo a","golpeó a","le soltó un buen golpe a","le dio un bife a","noqueó a"]);
}
