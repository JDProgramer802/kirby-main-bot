// @nombre: soporte
// @alias: support, ayuda_soporte
// @categoria: utilidad
// @descripcion: Ejemplo de mensaje con botones interactivos de soporte.
// @reaccion: 🛠️

export default async function(m, { conn, args, reply }) {
  // Si el comando viene con argumentos (desde un botón)
  if (args[0] === 'respuesta') {
    const calificacion = args.slice(1).join(' ');
    return reply(`✨ *¡Gracias por tu feedback!* 🌸\n\nHas calificado el soporte como: *${calificacion}*\n\nSeguiremos mejorando poyo! (っ◕‿◕)っ`);
  }

  // Si es el comando inicial, enviamos los botones
  const botones = [
    {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: 'Todo bien ✅',
        id: '/soporte respuesta Todo Bien'
      })
    },
    {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: 'Normal 😐',
        id: '/soporte respuesta Normal'
      })
    },
    {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: 'Podría ser mejor ❌',
        id: '/soporte respuesta Podría ser mejor'
      })
    }
  ];

  await conn.sendMessage(m.key.remoteJid, {
    text: '¿Cómo calificarías tu experiencia con el soporte? 🌸',
    footer: 'Kirby Dream Bot System',
    interactiveButtons: botones
  }, { quoted: m });
}
