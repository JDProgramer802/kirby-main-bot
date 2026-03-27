// @nombre: pinterest
// @alias: pinterest, pin
// @categoria: descargas
// @descripcion: Busca imágenes en Pinterest. (Uso: /pin [término])
// @reaccion: 🖼️

import axios from 'axios';

const sleep = ms => new Promise(r => setTimeout(r, ms));

const BROWSER = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept-Language': 'es-CO,es;q=0.9,en-US;q=0.8',
};

// ── Extrae todas las URLs de imágenes de Pinterest del HTML ──
function extraerURLsDelHTML(html) {
  const urls = new Set();

  const regexFlexible = /https:\/\/i\.pinimg\.com\/[^\s"'\\<>\]]+\.(?:jpg|jpeg|webp|png)/gi;
  for (const url of html.matchAll(regexFlexible)) {
    if (url[0].includes('736x') || url[0].includes('originals') || url[0].includes('474x')) {
      urls.add(url[0]);
    }
  }

  if (urls.size < 3) {
    for (const url of html.matchAll(regexFlexible)) {
      urls.add(url[0]);
    }
  }

  return [...urls];
}

// ── Método 1: Scraping directo de Pinterest ──────────────────
async function metodoPinterestScraping(query) {
  try {
    const url = `https://www.pinterest.com/search/pins/?q=${query}&rs=typed`;
    const { data: html } = await axios.get(url, {
      headers: { ...BROWSER, 'Accept': 'text/html' },
      timeout: 15000,
    });
    console.log(`│ Pinterest HTML: ${(html.length / 1024).toFixed(1)} KB`);
    const urls = extraerURLsDelHTML(html);
    console.log(`│ URLs encontradas: ${urls.length}`);
    return urls;
  } catch (e) {
    console.log(`│ ERROR Pinterest: ${e.message}`);
    return [];
  }
}

// ── Método 2: API siputzx ─────────────────────────────────────
async function metodoSiputzx(query) {
  try {
    const { data } = await axios.get(
      `https://api.siputzx.my.id/api/s/pinterest?query=${query}`,
      { timeout: 10000 }
    );
    const items = data?.data || data?.result || data?.results || [];

    if (items[0]) {
      console.log(`│ siputzx item[0] keys: ${Object.keys(items[0]).join(', ')}`);
      console.log(`│ siputzx item[0] full: ${JSON.stringify(items[0]).slice(0, 200)}`);
    }

    return items
      .map(i => {
        if (typeof i === 'string') return i;
        const candidates = [
          i?.images?.orig?.url, i?.images?.['736x']?.url, i?.images?.['474x']?.url,
          i?.url, i?.image, i?.media, i?.src, i?.img, i?.thumbnail,
          i?.pin_img, i?.image_url, i?.imageUrl,
        ];
        return candidates.find(u => u && typeof u === 'string' && u.includes('pinimg.com')) || null;
      })
      .filter(u => u && typeof u === 'string' && u.includes('pinimg.com'));
  } catch (e) {
    console.log(`│ siputzx ERROR: ${e.message}`);
    return [];
  }
}

// ── Método 3: APIs alternativas funcionales ──────────────────
async function metodoAlternas(query) {
  const urls = [];
  const apis = [
    {
      url: `https://api.itsrose.run/api/s/pinterest?query=${query}`,
      extract: d => d?.data || []
    },
    {
      url: `https://api.lain.run/api/s/pinterest?query=${query}`,
      extract: d => d?.data || []
    },
    {
      url: `https://api.gatabot.tech/api/search/pinterest?query=${query}`,
      extract: d => d?.result || d?.data || []
    },
    {
      url: `https://api.nekorinn.my.id/search/pinterest?q=${query}`,
      extract: d => d?.result || d?.data || []
    },
  ];

  for (const api of apis) {
    try {
      const { data } = await axios.get(api.url, { timeout: 8000 });
      const items = api.extract(data);
      console.log(`│ ${api.url.split('/')[2]}: ${items.length} items`);
      for (const item of items) {
        const u = typeof item === 'string' ? item
          : item?.images?.orig?.url || item?.images?.['736x']?.url
          || item?.url || item?.image || item?.media || null;
        if (u && typeof u === 'string' && u.startsWith('http')) urls.push(u);
      }
      if (urls.length >= 6) break;
    } catch (e) {
      console.log(`│ ${api.url.split('/')[2]}: ${e.message}`);
    }
  }
  return urls;
}

// ── MAIN ──────────────────────────────────────────────────────
export default async function (m, { conn, text, reply }) {
  if (!text) {
    return reply(
      `╭┈ ↷\n│ *‹ ᴘɪɴᴛᴇʀᴇꜱᴛ ›*\n│\n│ _ɪɴᴅɪᴄᴀ ǫᴜᴇ ʙᴜꜱᴄᴀʀ_\n│ _ᴇᴊᴇᴍᴘʟᴏ: /pin anime kawaii_\n╰─────────────────`
    );
  }

  await conn.sendMessage(m.key.remoteJid, {
    text: `╭┈ ↷\n│ *‹ ᴘɪɴᴛᴇʀᴇꜱᴛ ›*\n│\n│ _ʙᴜꜱᴄᴀɴᴅᴏ_ \`${text}\`_..._\n╰─────────────────`
  }, { quoted: m });

  const query = encodeURIComponent(text);
  let imagenes = [];

  console.log(`\n[PINTEREST] Buscando: "${text}"`);

  const metodos = [
    { nombre: 'Pinterest Scraping', fn: () => metodoPinterestScraping(query) },
    { nombre: 'siputzx API', fn: () => metodoSiputzx(query) },
    { nombre: 'APIs Alternativas', fn: () => metodoAlternas(query) },
  ];

  for (const { nombre, fn } of metodos) {
    console.log(`\n┌─── ${nombre}`);
    const resultado = await fn();
    const antes = imagenes.length;
    const set = new Set(imagenes.map(u => u.split('?')[0]));
    resultado.forEach(u => {
      if (!set.has(u.split('?')[0])) {
        imagenes.push(u);
        set.add(u.split('?')[0]);
      }
    });
    console.log(`│ +${imagenes.length - antes} nuevas | Total: ${imagenes.length}`);
    console.log(`└──────────────────────────────────────`);
    if (imagenes.length >= 8) break;
    await sleep(300);
  }

  if (imagenes.length === 0) {
    console.log(`[PINTEREST] Sin resultados`);
    return conn.sendMessage(m.key.remoteJid, {
      text: `╭┈ ↷\n│ *‹ ꜱɪɴ ʀᴇꜱᴜʟᴛᴀᴅᴏꜱ ›*\n│\n│ _ɴᴏ ꜱᴇ ᴇɴᴄᴏɴᴛʀᴀʀᴏɴ ɪᴍᴀɢᴇɴᴇꜱ ᴘᴀʀᴀ_\n│ _"${text}"_\n╰─────────────────`
    }, { quoted: m });
  }

  const seleccion = imagenes
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(imagenes.length, 8)); // hasta 8 imágenes

  if (seleccion.length === 0) {
    return conn.sendMessage(m.key.remoteJid, {
      text: `╭┈ ↷\n│ *‹ ꜱɪɴ ʀᴇꜱᴜʟᴛᴀᴅᴏꜱ ›*\n│\n│ _ɴᴏ ꜱᴇ ᴇɴᴄᴏɴᴛʀᴀʀᴏɴ ɪᴍᴀɢᴇɴᴇꜱ ᴠᴀ́ʟɪᴅᴀꜱ ᴘᴀʀᴀ_\n│ _"${text}"_\n╰─────────────────`
    }, { quoted: m });
  }

  const caption0 = `╭┈ ↷\n│ *‹ ᴘɪɴᴛᴇʀᴇꜱᴛ ›*\n│\n│ *‹ Búsqueda ›* \`${text}\`\n│ *‹ Imágenes ›* \`${seleccion.length}\`\n╰─────────────────`;

  console.log(`[PINTEREST] Enviando galería con ${seleccion.length} imágenes...`);

  // ── Galería: varias imágenes seguidas ───────────────────────
  try {
    await Promise.all(
      seleccion.map((url, i) =>
        conn.sendMessage(
          m.key.remoteJid,
          {
            image: { url },
            caption: i === 0 ? caption0 : ''
          },
          { quoted: m }
        )
      )
    );
    console.log(`[PINTEREST] ✓ Galería de ${seleccion.length} imágenes enviada`);
  } catch (err) {
    console.error('[PINTEREST] ERROR al enviar galería:', err);
    // Fallback a una sola imagen
    try {
      await conn.sendMessage(
        m.key.remoteJid,
        {
          image: { url: seleccion[0] },
          caption: caption0
        },
        { quoted: m }
      );
    } catch (e2) {
      console.error('[PINTEREST] ERROR fallback imagen:', e2);
    }
  }

  // ── Mensaje interactivo opcional (buttons) con @itsukichan/baileys ─────
  // Usa buttonReply como documenta el fork:
  // - type: 'interactive' para usar nativeFlows
  // Fuente: README de Itsukichann/Baileys. [web:69]
  try {
    const botones = seleccion.slice(0, 3).map((url, index) => ({
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: `Imagen ${index + 1}`,
        id: `pin_${index + 1}_${Date.now()}`
      })
    }));

    if (botones.length > 0) {
      await conn.sendMessage(
        m.key.remoteJid,
        {
          text: `Resultados de: ${text}\nElige una imagen para ver detalles.`,
          interactiveButtons: botones
        },
        { quoted: m }
      );
    }
  } catch (e) {
    console.error('[PINTEREST] ERROR mensaje interactivo:', e);
  }
}
