// @nombre: greet
// @alias: hi
// @categoria: anime
// @descripcion: Saludar a alguien
// @reaccion: 👋

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'greet', ["saludó a","le da la bienvenida a","dice hola a","le hace una señal a","le sonríe a"]);
}
