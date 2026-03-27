// @nombre: delbirth
// @alias: delbirth, delcumple, borrarcumple
// @categoria: perfiles
// @descripcion: Borra la información de tu cumpleaños.

import { query } from '../../src/lib/database.js';

export default async function (m, { sender, reply }) {
  try {
    await query(`UPDATE usuarios SET cumpleanos = '' WHERE jid = $1`, [sender]);
    reply('✅ *¡Listo!* Tu cumpleaños fue borrado del calendario mágico. 🌸');
  } catch (e) {
    reply('❌ *Error.*');
  }
}
