// @nombre: serieinfo
// @alias: serieinfo, infoserie
// @categoria: gacha
// @descripcion: Muestra información extraída de AniList sobre una serie específica.

import { anilistQuery } from '../../src/lib/anilist.js';

export default async function (m, { conn, text, reply }) {
  if (!text) {
    return reply('⚠️ *¡Ay!* Dime de qué serie quieres buscar info. `Ejemplo: /serieinfo Sword Art Online` 🌸');
  }

  reply('☁️ ✨ _Buscando en los registros de la galaxia..._');

  const queryInfo = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        description
        episodes
        status
        coverImage {
          large
        }
        averageScore
      }
    }
  `;

  try {
    const res = await anilistQuery(queryInfo, { search: text });
    const serie = res?.data?.Media;

    if (!serie) {
      return reply(`❌ *Aww...* No pude encontrar información de "${text}" en AniList. Intenta con su nombre completo. 😿`);
    }

    const title = serie.title.english || serie.title.romaji || serie.title.native;
    // Limpiamos la descripción de tags HTML básicos que manda AniList
    const desc = (serie.description || 'Sin descripción.').replace(/<[^>]*>?/gm, '').substring(0, 300) + '...';

    let caption = `╭ ꒰ 📺 𝓘𝓷𝓯𝓸 𝓭𝓮 𝓢𝓮𝓻𝓲𝓮 📺 ꒱\n`;
    caption += `┊ 🎬 *Título:* ${title}\n`;
    caption += `┊ 💿 *Episodios:* ${serie.episodes || '?'}\n`;
    caption += `┊ 📊 *Score:* ${serie.averageScore}% \n`;
    caption += `┊ 📡 *Estado:* ${serie.status}\n`;
    caption += `┊ \n`;
    caption += `┊ 📝 *Sinopsis:*\n`;
    caption += `┊ _${desc}_\n`;
    caption += `╰━━━━━━━━━━━━━━━━━ 💕`;

    if (serie.coverImage.large) {
      await conn.sendMessage(m.key.remoteJid, {
        image: { url: serie.coverImage.large },
        caption: caption
      }, { quoted: m });
    } else {
      reply(caption);
    }

  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* La conexión con AniList falló de momento.');
  }
}
