// @nombre: packdesc
// @alias: packdesc
// @categoria: stickers
// @descripcion: Alias para configurar la descripción. Usa /setmeta.

import setmeta from './setmeta.js';

export default async function (m, context) {
  return setmeta(m, context);
}
