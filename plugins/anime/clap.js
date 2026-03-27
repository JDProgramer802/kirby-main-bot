// @nombre: clap
// @alias: aplaudir
// @categoria: anime
// @descripcion: Aplaudir
// @reaccion: 👏

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'clap', ["le aplaudió a","aplaude emocionado por","celebra los logros de","le da una ovación a","está orgulloso de"]);
}
