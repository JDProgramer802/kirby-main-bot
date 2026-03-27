// @nombre: delgenre
// @alias: delgenre, delgender
// @categoria: perfiles
// @descripcion: Borra la información de tu género.

import { query } from '../../src/lib/database.js';

export default async function (m, { sender, reply }) {
  try {
    await query(`UPDATE usuarios SET genero = '' WHERE jid = $1`, [sender]);
    reply('✅ *¡Listo!* Tu género fue ocultado en las sombras. 🌸');
  } catch (e) {
    reply('❌ *Error.*');
  }
}
