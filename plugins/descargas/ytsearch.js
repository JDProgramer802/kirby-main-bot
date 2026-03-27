// @nombre: ytsearch
// @alias: ytsearch, yts, buscar
// @categoria: descargas
// @descripcion: Realiza una búsqueda en YouTube y devuelve los enlaces y títulos. (Uso: /yts [término])

import axios from 'axios';

export default async function (m, { conn, text, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* ¿Qué quieres buscar en YouTube? `Ejemplo: /yts Kirby` 🌸');
  }

  reply('☁️ ✨ _Investigando el catálogo..._ 🔎');

  try {
    const searchUrl = `https://api.siputzx.my.id/api/s/youtube?query=${encodeURIComponent(text)}`;
    const searchRes = await axios.get(searchUrl);
    const results = searchRes.data?.data;
    
    if (!results || results.length === 0) {
      return reply(`❌ *Aww...* No encontré ningún video que coincida con "${text}". 😿`);
    }

    let txt = `╭ ꒰ 🔎 𝓑𝓾𝓼𝓺𝓾𝓮𝓭𝓪 𝓚𝓪𝔀𝓪𝓲𝓲 🔎 ꒱\n`;
    txt += `┊ 🎬 *Para:* ${text}\n`;
    txt += `┊ \n`;

    // Mostramos los primeros 5-7 resultados
    const limit = Math.min(results.length, 7);
    for (let i = 0; i < limit; i++) {
       const v = results[i];
       txt += `┊ ${i + 1}. *${v.title}*\n`;
       txt += `┊    ↳ 🕒 ${v.duration} | 👁️ ${v.views}\n`;
       txt += `┊    ↳ 🔗 ${v.url}\n`;
       txt += `┊ \n`;
    }
    
    txt += `╰━━━━━━━━━━━━━━━━━ 💕\n_Para descargar usa el link con /mp4 o /play_`;

    await reply(txt);

  } catch (err) {
    console.error(err);
    reply('❌ *Oh oh...* A YouTube no le gustó nuestra búsqueda.');
  }
}
