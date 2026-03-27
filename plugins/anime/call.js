// @nombre: call
// @categoria: anime
// @descripcion: Llamar a alguien
// @reaccion: 📞

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'call', ["llamó a","está llamando a","quiere hablar con","necesita decirte algo a","te está marcando"]);
}
