// @nombre: run
// @categoria: anime
// @descripcion: Correr
// @reaccion: 🏃‍♂️

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'run', ["salió corriendo de","escapa de","está huyendo de","no quiere que lo atrapen por","corre por su vida de"]);
}
