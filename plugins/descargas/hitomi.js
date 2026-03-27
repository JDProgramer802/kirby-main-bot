// @nombre: hitomi
// @alias: hitomi, hitomila
// @categoria: descargas
// @descripcion: Búsqueda cruda de doujins en Hitomi.la

export default async function (m, { text, isGroup, dbGroup, reply }) {
  if (!text) {
    return reply('⚠️ *¡Eh!* Envía un término o ID. `Ejemplo: /hitomi naruto` 🌸');
  }

  if (isGroup && !dbGroup.nsfw) {
    return reply('❌ *¡Alto ahí!* 🐷 El contenido NSFW está desactivado. Usa `/nsfw on`.');
  }

  // Hitomi no tiene API pública sencilla sin cifrado, enviamos enlace de búsqueda directo
  const busqueda = encodeURIComponent(text.trim());

  let txt = `╭ ꒰ 🔞 𝓗𝓲𝓽𝓸𝓶𝓲.𝓵𝓪 🔞 ꒱\n`;
  txt += `┊ 🔎 *Búsqueda:* ${text}\n`;
  txt += `┊ ✨ _La magia de Hitomi está protegida por magia antigua. Pero aquí tienes tu portal:_\n`;
  txt += `┊ 🔗 https://hitomi.la/search.html?${busqueda}\n`;
  txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

  reply(txt);
}
