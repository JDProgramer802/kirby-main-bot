// @nombre: winfo
// @alias: winfo,
// @categoria: gacha
// @descripcion: Alias para el comando /gachainfo

import gachainfo from './gachainfo.js';

export default async function (m, context) {
  return gachainfo(m, context);
}
