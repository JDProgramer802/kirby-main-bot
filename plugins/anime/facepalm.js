// @nombre: facepalm
// @categoria: anime
// @descripcion: Facepalm
// @reaccion: 🤦‍♂️

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'facepalm', ["se dio un facepalm por","no puede creer lo de","se decepcionó de","está harto de las tonterías de","se golpea la frente por"]);
}
