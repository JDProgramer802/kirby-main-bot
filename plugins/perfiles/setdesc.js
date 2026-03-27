// @nombre: setdesc
// @alias: setdesc, setdescripcion
// @categoria: perfiles
// @descripcion: Alias de /setbio

import setbio from './setbio.js';

export default async function (m, context) {
  return setbio(m, context);
}
