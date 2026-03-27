// @nombre: allbirthdays
// @alias: allbirthdays, todoscumples
// @categoria: perfiles
// @descripcion: Alias de birthdays. Lista de cumpleaños.

import birthdays from './birthdays.js';

export default async function (m, context) {
  return birthdays(m, context);
}
