// @nombre: sing
// @categoria: anime
// @descripcion: Cantar
// @reaccion: 🎤

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, 'sfw', 'sing', ["le está cantando a","entona una melodía para","es el cantante favorito de","le dedica una canción a","da un concierto para"]);
}
