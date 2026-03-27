// @nombre: blush
// @categoria: anime
// @descripcion: Sonrojarte
// @reaccion: 😳

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'blush', ["se sonrojó por","está muy apenado por","se puso rojo por","no puede ocultar su vergüenza ante","se siente halagado por","se puso como un tomate por"]);
}
