// @nombre: bithdays
// @alias: bithdays, cumpleanos
// @categoria: perfiles
// @descripcion: Alias de /birthdays (Por un typo común)

import birthdays from './birthdays.js';

export default async function (m, context) {
  return birthdays(m, context);
}
