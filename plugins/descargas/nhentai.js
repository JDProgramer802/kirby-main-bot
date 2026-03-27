// @nombre: nhentai
// @alias: nhentai, nh
// @categoria: descargas
// @descripcion: Obtiene en formato PDF o visual información de un doujinshi NSFW en nHentai. Usa el ID de la galería.

import axios from 'axios';

export default async function (m, { conn, text, isGroup, dbGroup, reply }) {
  if (!text) {
    return reply('⚠️ *¡Eh!* Tienes que enviar los números sagrados. `Ejemplo: /nh 177013` 🌸');
  }

  if (isGroup && !dbGroup.nsfw) {
    return reply('❌ *¡Alto ahí puerco!* 🐷 Los comandos NSFW están bloqueados en este grupo.\nPídele a un admin que use `/nsfw on` primero.');
  }

  reply('☁️ ✨ _Investigando en la biblioteca oculta..._ 🔞');

  try {
    const apiUrl = `https://nhentai.net/api/gallery/${text.trim()}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    let title = data.title.english || data.title.japanese;
    let pages = data.num_pages;
    let tags = data.tags.filter(t => t.type === 'tag').map(t => t.name).join(', ');

    let txt = `╭ ꒰ 🔞 𝓑𝓲𝓫𝓵𝓲𝓸𝓽𝓮𝓬𝓪 𝓞𝓼𝓬𝓾𝓻𝓪 🔞 ꒱\n`;
    txt += `┊ 📖 *Título:* ${title}\n`;
    txt += `┊ 📄 *Páginas:* ${pages}\n`;
    txt += `┊ 🏷️ *Etiquetas:* ${tags.substring(0, 80) + '...'}\n`;
    txt += `┊ 🔗 *Link:* https://nhentai.net/g/${data.id}/\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    const coverId = data.media_id;
    const coverType = data.images.cover.t === 'j' ? 'jpg' : 'png';
    const coverUrl = `https://t.nhentai.net/galleries/${coverId}/cover.${coverType}`;

    await conn.sendMessage(m.key.remoteJid, {
      image: { url: coverUrl },
      caption: txt
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Los bibliotecarios ninjas borraron ese documento. (El código no existe o hubo un error de conexión)');
  }
}
