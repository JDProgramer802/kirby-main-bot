// @nombre: fetchmascotas
// @alias: actualizarmascotas, scanmascotas
// @categoria: admin
// @descripcion: Busca y actualiza automáticamente la base de datos de mascotas desde internet.
// @reaccion: 🛠️

import axios from 'axios';
import { query } from '../../src/lib/database.js';
import { log } from '../../src/lib/utils.js';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

const KIRBY_CHARACTERS = [
  'Kirby', 'Meta Knight', 'King Dedede', 'Bandana Waddle Dee', 'Waddle Doo',
  'Whispy Woods', 'Rick the Hamster', 'Kine the Fish', 'Coo the Owl',
  'Marx', 'Gooey', 'Adeleine', 'Ribbon', 'Dark Meta Knight', 'Daroach',
  'Magolor', 'Taranza', 'Susie', 'Francisca', 'Flamberge', 'Zan Partizanne',
  'Elfilin', 'Galacta Knight', 'Morpho Knight', 'Chef Kawasaki', 'Prince Fluff',
  'Elline', 'Shadow Kirby', 'Void Termina', 'Fecto Elfilis', 'Kracko',
  'Fighter Kirby', 'Beam Kirby', 'Sword Kirby', 'Fire Kirby',
  'Ice Kirby', 'Cutter Kirby', 'Bomb Kirby', 'Ninja Kirby', 'Hammer Kirby'
];

// ─────────────────────────────────────────────
// FUENTE 1: Kirby Wiki (Fandom) – MediaWiki API
// La más confiable: imágenes oficiales, sin bloqueos.
// ─────────────────────────────────────────────
async function buscarEnKirbyWiki(character) {
  try {
    const terms = [
      character,
      character.includes('Kirby') ? character : `${character} (character)`,
    ];

    for (const term of terms) {
      // Buscar el artículo en la wiki
      const searchUrl = `https://kirby.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&srlimit=3&format=json&origin=*`;
      const searchRes = await axios.get(searchUrl, { timeout: 10000 });
      const results = searchRes.data?.query?.search || [];
      if (!results.length) continue;

      const pageTitle = results[0].title;

      // Obtener imágenes del artículo
      const imgUrl = `https://kirby.fandom.com/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=images&imlimit=10&format=json&origin=*`;
      const imgRes = await axios.get(imgUrl, { timeout: 10000 });
      const pages = imgRes.data?.query?.pages || {};
      const page = Object.values(pages)[0];
      const images = page?.images || [];

      // Filtrar imágenes con "artwork" o "render" en el nombre
      const artworkKeywords = ['artwork', 'render', 'art', 'official', character.split(' ')[0].toLowerCase()];
      const filtered = images.filter(img => {
        const name = img.title.toLowerCase();
        return (
          artworkKeywords.some(kw => name.includes(kw)) &&
          !name.includes('icon') &&
          !name.includes('flag') &&
          !name.includes('button') &&
          (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.webp'))
        );
      });

      const chosen = filtered[0] || images.find(i => !i.title.toLowerCase().includes('icon'));
      if (!chosen) continue;

      // Obtener la URL real del archivo
      const fileUrl = `https://kirby.fandom.com/api.php?action=query&titles=${encodeURIComponent(chosen.title)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
      const fileRes = await axios.get(fileUrl, { timeout: 10000 });
      const filePages = fileRes.data?.query?.pages || {};
      const filePage = Object.values(filePages)[0];
      const imageUrl = filePage?.imageinfo?.[0]?.url;

      if (imageUrl) return imageUrl;
    }

    return null;
  } catch (e) {
    log('ERROR', `KirbyWiki Error (${character}): ${e.message}`);
    return null;
  }
}

// ─────────────────────────────────────────────
// FUENTE 2: SmashWiki – para personajes en Smash
// ─────────────────────────────────────────────
async function buscarEnSmashWiki(character) {
  try {
    const searchUrl = `https://www.ssbwiki.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(character)}&srlimit=1&format=json&origin=*`;
    const searchRes = await axios.get(searchUrl, { timeout: 10000 });
    const results = searchRes.data?.query?.search || [];
    if (!results.length) return null;

    const pageTitle = results[0].title;
    const imgUrl = `https://www.ssbwiki.com/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=images&imlimit=10&format=json&origin=*`;
    const imgRes = await axios.get(imgUrl, { timeout: 10000 });
    const pages = imgRes.data?.query?.pages || {};
    const page = Object.values(pages)[0];
    const images = page?.images || [];

    const chosen = images.find(i => {
      const n = i.title.toLowerCase();
      return (n.includes('artwork') || n.includes('render')) && (n.endsWith('.png') || n.endsWith('.jpg'));
    });
    if (!chosen) return null;

    const fileUrl = `https://www.ssbwiki.com/api.php?action=query&titles=${encodeURIComponent(chosen.title)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
    const fileRes = await axios.get(fileUrl, { timeout: 10000 });
    const filePages = fileRes.data?.query?.pages || {};
    const filePage = Object.values(filePages)[0];
    return filePage?.imageinfo?.[0]?.url || null;
  } catch (e) {
    log('ERROR', `SmashWiki Error (${character}): ${e.message}`);
    return null;
  }
}

// ─────────────────────────────────────────────
// FUENTE 3: Wikimedia Commons (fallback general)
// ─────────────────────────────────────────────
async function buscarEnWikimedia(character) {
  try {
    const queryStr = encodeURIComponent(`Kirby ${character} artwork`);
    const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${queryStr}&srnamespace=6&srlimit=5&format=json&origin=*`;
    const res = await axios.get(url, { timeout: 10000 });
    const results = res.data?.query?.search || [];
    if (!results.length) return null;

    const chosen = results.find(r => {
      const t = r.title.toLowerCase();
      return (t.includes('artwork') || t.includes('kirby')) && (t.endsWith('.png') || t.endsWith('.jpg'));
    }) || results[0];

    const fileUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(chosen.title)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
    const fileRes = await axios.get(fileUrl, { timeout: 10000 });
    const filePages = fileRes.data?.query?.pages || {};
    const filePage = Object.values(filePages)[0];
    return filePage?.imageinfo?.[0]?.url || null;
  } catch (e) {
    log('ERROR', `Wikimedia Error (${character}): ${e.message}`);
    return null;
  }
}

// ─────────────────────────────────────────────
// FUENTE 4: Bing Images (último recurso, más estable que Google)
// ─────────────────────────────────────────────
async function buscarEnBing(character) {
  try {
    const queryBase = character.toLowerCase().includes('kirby') ? character : `Kirby ${character}`;
    const queryStr = encodeURIComponent(`${queryBase} official artwork transparent`);
    const url = `https://www.bing.com/images/search?q=${queryStr}&first=1&tsc=ImageBasicHover`;

    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.bing.com/',
      },
      timeout: 12000
    });

    // Intentar extraer murl (URL original de la imagen)
    const murlRegex = /"murl":"(https?:\/\/[^"]+\.(?:png|jpg|jpeg|webp))"/g;
    const murlMatches = [];
    let match;
    while ((match = murlRegex.exec(html)) !== null) {
      murlMatches.push(match[1]);
    }
    if (murlMatches[0]) return murlMatches[0];

    // Fallback: miniaturas de Bing
    const thumbRegex = /src="(https:\/\/tse\d+\.mm\.bing\.net\/th\?id=[^"&]+)(?:&[^"]*)?"/g;
    const thumbMatches = [];
    while ((match = thumbRegex.exec(html)) !== null) {
      thumbMatches.push(match[1]);
    }
    return thumbMatches[0] || null;
  } catch (e) {
    log('ERROR', `Bing Error (${character}): ${e.message}`);
    return null;
  }
}

// ─────────────────────────────────────────────
// MOTOR PRINCIPAL: Prueba fuentes en orden
// ─────────────────────────────────────────────
async function buscarImagen(character) {
  const fuentes = [
    { fn: buscarEnKirbyWiki, nombre: 'KirbyWiki' },
    { fn: buscarEnSmashWiki, nombre: 'SmashWiki' },
    { fn: buscarEnWikimedia, nombre: 'Wikimedia' },
    { fn: buscarEnBing,      nombre: 'Bing'      },
  ];

  for (const { fn, nombre } of fuentes) {
    const img = await fn(character);
    if (img) return { url: img, engine: nombre };
  }
  return { url: null, engine: null };
}

// ─────────────────────────────────────────────
// COMANDO PRINCIPAL
// ─────────────────────────────────────────────
export default async function(m, { conn, reply, isOwner }) {
  if (!isOwner) return reply('❌ Solo el dueño puede ejecutar este comando mijo.');

  const chatJid = m.key.remoteJid;
  if (!chatJid) {
    log('ERROR', 'remoteJid no definido.');
    return reply('❌ Error interno: No se pudo identificar el chat.');
  }

  const startMsg = await reply(
    '🔍 *Iniciando escaneo Multi-Motor en Dream Land...* 🌸\n' +
    'Fuentes: KirbyWiki → SmashWiki → Wikimedia → Bing'
  );

  let totalNuevos = 0;
  let totalErrores = 0;
  let logs = [];
  let detailedLogs = [];

  for (let i = 0; i < KIRBY_CHARACTERS.length; i++) {
    const char = KIRBY_CHARACTERS[i];
    log('INFO', `[${i+1}/${KIRBY_CHARACTERS.length}] Buscando: ${char}`);

    const { url: img, engine } = await buscarImagen(char);

    if (img) {
      try {
        const atq = Math.floor(Math.random() * 20) + 10;
        const def = Math.floor(Math.random() * 20) + 10;

        await query(
          `INSERT INTO mascotas_pool (nombre_personaje, imagen_url, atq, def)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (nombre_personaje)
           DO UPDATE SET imagen_url = $2`,
          [char, img, atq, def]
        );

        totalNuevos++;
        log('OK', `✅ ${char} guardado (${engine})`);
        logs.push(`✅ ${char} (${engine})`);
        detailedLogs.push(`- *${char}*: Encontrado vía ${engine}`);
      } catch (e) {
        log('ERROR', `Error DB ${char}: ${e.message}`);
        totalErrores++;
        logs.push(`❌ ${char} (Error DB)`);
        detailedLogs.push(`- *${char}*: ❌ Error de base de datos`);
      }
    } else {
      log('WARN', `No encontrado: ${char}`);
      totalErrores++;
      logs.push(`⚠️ ${char} (No encontrado)`);
      detailedLogs.push(`- *${char}*: ⚠️ Sin imagen en ningún motor`);
    }

    // Progreso cada 5 personajes
    if ((i + 1) % 5 === 0 || (i + 1) === KIRBY_CHARACTERS.length) {
      const progreso = Math.round(((i + 1) / KIRBY_CHARACTERS.length) * 100);
      const txtProgreso =
        `⏳ *Progreso:* ${i + 1}/${KIRBY_CHARACTERS.length} (${progreso}%)\n\n` +
        logs.slice(-5).join('\n');

      try {
        if (startMsg?.key) {
          await conn.sendMessage(chatJid, { text: txtProgreso, edit: startMsg.key }, { quoted: m });
        } else {
          await reply(txtProgreso);
        }
      } catch (e) {
        log('ERROR', `Error editando progreso: ${e.message}`);
        await reply(txtProgreso);
      }
    }

    // Delay para evitar rate limiting (un poco más en Bing)
    await new Promise(r => setTimeout(r, 1500));
  }

  // Reporte final
  const summary =
    `✅ *¡Escaneo finalizado!* 🌸✨\n\n` +
    `📊 *Estadísticas:*\n` +
    `- Éxitos: \`${totalNuevos}\`\n` +
    `- Fallidos: \`${totalErrores}\`\n\n` +
    `📝 *Detalle:*\n` +
    detailedLogs.join('\n') +
    `\n\n¡Dream Land está más poblado que nunca mijo! ☁️✨`;

  if (summary.length > 4000) {
    await reply(
      `✅ *¡Escaneo finalizado!*\n` +
      `Éxitos: ${totalNuevos} | Fallidos: ${totalErrores}\n` +
      `(Log detallado omitido por longitud)`
    );
  } else {
    await reply(summary);
  }
}
