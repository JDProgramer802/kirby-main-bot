// @nombre: setbirth
// @alias: setbirth, setcumple
// @categoria: perfiles
// @descripcion: Alias de /setbirthday

import setbirthday from './setbirthday.js';

export default async function (m, context) {
  return setbirthday(m, context);
}
