// @nombre: allwaifus
// @alias: allwaifus, mishusbandos, miwok
// @categoria: perfiles
// @descripcion: Alias para /serielist o ver tu harem. Muestra a todos tus personajes obtenidos.

import gachaHarem from '../gacha/harem.js';

export default async function (m, context) {
  // Simplemente redirigimos al comando de harem del gacha
  return gachaHarem(m, context);
}
