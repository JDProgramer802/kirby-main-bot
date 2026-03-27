// @nombre: suggest
// @alias: add, addanime, report
// @categoria: utilidad
// @descripcion: Solicitar un anime/serie/juego/personaje faltante
// @reaccion: 💡

export default async function(m, { reply, args, sender }) {
  const texto = args.join(' ').trim();
  if (!texto) {
    return reply('❗ *Uso correcto:* #suggest <Nombre>\nEj: #suggest Fullmetal Alchemist');
  }

  // TODO: Integrar con una tabla de sugerencias para soporte posterior.
  await reply(`✅ Gracias por tu sugerencia, ${sender.split('@')[0]}!\n🔖 Item sugerido: *${texto}*\n
Nuestro equipo lo revisará y podrá agregarlo pronto.`);
}

