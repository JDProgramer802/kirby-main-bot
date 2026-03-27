// @nombre: buscamascota
// @alias: findpet, buscapet
// @categoria: diversion
// @descripcion: Busca imágenes de Kirby y sus amigos para tu mascota.
// @reaccion: 🔍

import axios from 'axios';
import { log } from '../../src/lib/utils.js';

const BROWSER = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

async function buscarGoogle(query) {
  try {
    const queryBase = query.toLowerCase().includes('kirby') ? query : `Kirby ${query}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(queryBase + ' official artwork png')}&tbm=isch`;
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Mobile Safari/537.36' },
      timeout: 10000
    });
    const regex = /src="(https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=[^"]+)"/g;
    let matches = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      if (!match[1].includes('favicon')) matches.push(match[1]);
    }
    return matches.slice(0, 5);
  } catch (e) {
    log('ERROR', `Google Search Error (${query}): ${e.message}`);
    return [];
  }
}

async function buscarPinterest(query) {
  try {
    const queryBase = query.toLowerCase().includes('kirby') ? query : `Kirby ${query}`;
    const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(queryBase + ' official render png')}`;
    const { data: html } = await axios.get(url, { headers: BROWSER, timeout: 10000 });
    const regex = /https:\/\/i\.pinimg\.com\/[^\s"'\\<>\]]+\.(?:jpg|jpeg|webp|png)/gi;
    const matches = html.match(regex) || [];
    return [...new Set(matches)].filter(u => u.includes('236x') || u.includes('736x')).slice(0, 5);
  } catch (e) {
    log('ERROR', `Pinterest Search Error (${query}): ${e.message}`);
    return [];
  }
}

async function buscarBing(query) {
  try {
    const queryBase = query.toLowerCase().includes('kirby') ? query : `Kirby ${query}`;
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(queryBase + ' official artwork transparent')}&first=1`;
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
      timeout: 10000
    });
    const regex = /src="(https:\/\/tse\d+\.mm\.bing\.net\/th\?id=[^"]+)"/g;
    let matches = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      matches.push(match[1]);
    }
    return matches.slice(0, 5);
  } catch (e) {
    log('ERROR', `Bing Search Error (${query}): ${e.message}`);
    return [];
  }
}

async function buscarDuckDuckGo(query) {
  try {
    const queryBase = query.toLowerCase().includes('kirby') ? query : `Kirby ${query}`;
    const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(queryBase + ' official artwork png')}+images`;
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)' },
      timeout: 10000
    });
    const regex = /(https?:\/\/[^"'\s<>]+?\.(?:png|jpg|jpeg|webp))/gi;
    const matches = html.match(regex) || [];
    const filtered = matches.filter(u => !u.includes('duckduckgo.com') && !u.includes('favicon'));
    return filtered.slice(0, 5);
  } catch { return []; }
}

export default async function(m, { conn, text, reply }) {
  if (!text) return reply('⚠️ *¡Ay mijo!* Dime qué personaje de Kirby quieres buscar.\n\n*Ejemplo:* `/buscamascota Meta Knight`');

  const chatJid = m.key.remoteJid;
  await reply(`🔍 *Iniciando búsqueda Multi-Motor para "${text}"...* 🌸\nBuscando en Google, Pinterest, Bing y DuckDuckGo.`);

  try {
    log('INFO', `Buscando imágenes para: ${text}`);

    // Ejecutar búsquedas en paralelo para mayor velocidad
    const [googleRes, pinterestRes, bingRes, ddgRes] = await Promise.all([
      buscarGoogle(text),
      buscarPinterest(text),
      buscarBing(text),
      buscarDuckDuckGo(text)
    ]);

    const allImages = [
      ...googleRes.map(url => ({ url, source: 'Google' })),
      ...bingRes.map(url => ({ url, source: 'Bing' })),
      ...pinterestRes.map(url => ({ url, source: 'Pinterest' })),
      ...ddgRes.map(url => ({ url, source: 'DuckDuckGo' }))
    ];

    if (allImages.length === 0) {
      return reply('❌ *¡Poyo!* No encontré imágenes para ese personaje en ningún motor. Intenta con otro nombre.');
    }

    // Mezclar y elegir 3 de diferentes fuentes si es posible
    const seleccion = allImages
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    for (const item of seleccion) {
      const { url, source } = item;
      const botones = [
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: 'Usar esta imagen ✅',
            id: `/adoptar ${text} | ${url}`
          })
        }
      ];

      await conn.sendMessage(chatJid, {
        image: { url },
        caption: `✨ *Resultado de ${source} para:* ${text}\n\n¿Te gusta esta imagen? ¡Púlsale al botón para adoptarla! 🌸`,
        interactiveButtons: botones
      }, { quoted: m });
    }

    log('OK', `Búsqueda finalizada para ${text}. Encontradas ${allImages.length} imágenes.`);

  } catch (err) {
    log('ERROR', `Error en buscamascota: ${err.message}`);
    reply('❌ *Oh no...* Se me perdió la lupa buscando. Inténtalo de nuevo.');
  }
}
