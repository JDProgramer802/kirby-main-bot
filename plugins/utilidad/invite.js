// @nombre: invite
// @categoria: utilidad
// @descripcion: Invitar al bot a un grupo.
// @reaccion: 💌

import { kirbyBox, separador } from '../../src/lib/utils.js';

export default async function(m, { conn, args, reply }) {
  const texto = args.join(' ').trim();
  if (!texto) {
    const title = 'Invitar a Kirby';
    const lines = ['Usa: /invite <enlace-de-invitación>', 'Ej: /invite https://chat.whatsapp.com/AbCdEfGhIjKlMnOpQrSt'];
    const footer = 'Sin enlace';
    return reply(`${separador('✨')}\n${kirbyBox(title, lines, footer)}\n${separador('✨')}`);
  }

  const match = texto.match(/(https?:\/\/chat\.whatsapp\.com\/|chat\.whatsapp\.com\/)?([A-Za-z0-9_-]+)/);
  const code = match ? match[2] : null;

  if (!code) {
    const title = 'Invitación inválida';
    const lines = ['El enlace no es correcto.'];
    const footer = 'Intenta de nuevo';
    return reply(`${separador('❗')}\n${kirbyBox(title, lines, footer)}\n${separador('❗')}`);
  }

  try {
    await conn.groupAcceptInvite(code);
    const title = '¡Listo!';
    const lines = ['✅ Me uní al grupo correctamente.'];
    const footer = '¡Bienvenido!';
    await reply(`${separador('🌸')}\n${kirbyBox(title, lines, footer)}\n${separador('🌸')}`);
  } catch (err) {
    console.error('invite error', err);
    const title = 'Oops...';
    const lines = ['No pude unirme. Enlace caducado o inválido.'];
    const footer = 'Verifica el link';
    await reply(`${separador('❌')}\n${kirbyBox(title, lines, footer)}\n${separador('❌')}`);
  }
}

