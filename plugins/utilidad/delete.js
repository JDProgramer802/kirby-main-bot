// @nombre: delete
// @alias: del
// @categoria: utilidad
// @descripcion: Elimina un mensaje citado.
// @reaccion: 🗑️

import { kirbyBox, obtenerCitado, separador } from '../../src/lib/utils.js';

export default async function(m, { conn, reply, react }) {
  const citado = obtenerCitado(m);
  if (!citado) {
    return reply(`${separador('✨')}\n` + kirbyBox('Oopsie!', ['Debes responder/citar el mensaje que quieres eliminar.'], 'Intenta de nuevo') + `\n${separador('✨')}`);
  }

  try {
    // Reaccionar al mensaje del comando
    await react('🗑️');
    // Eliminar el mensaje citado
    await conn.sendMessage(m.key.remoteJid, { delete: citado.clave });
  } catch (err) {
    console.error(err);
    reply(`${separador('❗')}\n` + kirbyBox('Error', ['No pude eliminar el mensaje. Comprueba permisos y antigüedad.'], 'Admin necesario') + `\n${separador('❗')}`);
  }
}

