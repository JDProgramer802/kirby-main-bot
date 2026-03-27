// @nombre: shy
// @alias: timido
// @categoria: anime
// @descripcion: Tímido
// @reaccion: 😳

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'shy', ["siente mucha timidez con","se esconde tímidamente de","está apenado con","no puede ver a los ojos a","se sonrojó por culpa de"]);
}
