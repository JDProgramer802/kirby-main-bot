// @nombre: gp
// @alias: gp, getprofile
// @categoria: perfiles
// @descripcion: Alias de /profile

import profile from './profile.js';

export default async function (m, context) {
  return profile(m, context);
}
