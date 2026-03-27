// @nombre: undress
// @alias: encuerar
// @categoria: nsfw
// @descripcion: Desnudar
// @reaccion: 👗

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'nsfw', 'undress', ["desnudó a","le quitó la ropa a","dejó al descubierto a","le quitó hasta los calzones a"]);
}
