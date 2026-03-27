// ─────────────────────────────────────────────────────────────────────────────
// src/lib/anilist.js — Integración con la API de AniList para Gacha
// ─────────────────────────────────────────────────────────────────────────────
import axios from 'axios';
import { query } from './database.js';

const ANILIST_API = 'https://graphql.anilist.co';

/**
 * Consulta la API de AniList con GraphQL
 */
export async function anilistQuery(queryStr, variables) {
  try {
    const res = await axios.post(
      ANILIST_API,
      { query: queryStr, variables },
      { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
    );
    return res.data;
  } catch (error) {
    if (error.response?.data?.errors) {
      console.error('AniList API Error:', error.response.data.errors);
    }
    throw new Error('Error de conexión con AniList.');
  }
}

/**
 * Busca un personaje aleatorio en AniList considerando popularidad
 */
export async function rollearPersonaje() {
  // Sacamos una página aleatoria de los personajes más favoritos
  const pagina = Math.floor(Math.random() * 200) + 1;
  const q = `
    query ($page: Int) {
      Page(page: $page, perPage: 1) {
        characters(sort: FAVOURITES_DESC) {
          id
          name {
            full
            native
          }
          image {
            large
          }
          favourites
          media(sort: POPULARITY_DESC, perPage: 1) {
            nodes {
              title {
                romaji
                english
              }
            }
          }
        }
      }
    }
  `;

  const data = await anilistQuery(q, { page: pagina });
  const char = data?.data?.Page?.characters?.[0];

  if (!char) throw new Error('No se pudo encontrar un personaje.');

  const animename = char.media?.nodes?.[0]?.title?.english || char.media?.nodes?.[0]?.title?.romaji || 'Unknown Series';

  // Guardar en la base de datos de personajes globales
  await query(
    `INSERT INTO personajes_disponibles (anilist_id, nombre, nombre_romaji, serie, imagen_url, rareza) 
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (anilist_id) DO UPDATE SET 
     nombre = $2, nombre_romaji = $3, serie = $4, imagen_url = $5`,
    [char.id, char.name.full, char.name.native || '', animename, char.image.large, calcularRareza(char.favourites)]
  );

  const res = await query(`SELECT id FROM personajes_disponibles WHERE anilist_id = $1`, [char.id]);

  return {
    db_id: res.rows[0].id,
    anilist_id: char.id,
    nombre: char.name.full,
    serie: animename,
    imagen: char.image.large,
    rareza: calcularRareza(char.favourites),
    favoritos: char.favourites
  };
}

/**
 * Calcula la rareza de 1 a 6 estrellas basándose en los favoritos
 */
function calcularRareza(favs) {
  if (favs > 50000) return 6; // Legendario
  if (favs > 20000) return 5; // Mítico
  if (favs > 5000) return 4;  // Épico
  if (favs > 1000) return 3;  // Raro
  if (favs > 100) return 2;   // Poco común
  return 1;                   // Común
}

/**
 * Busca un personaje por nombre
 */
export async function buscarPersonaje(nombre) {
  const q = `
    query ($search: String) {
      Character(search: $search) {
        id
        name {
          full
          native
        }
        image {
          large
        }
        favourites
        media(sort: POPULARITY_DESC, perPage: 1) {
          nodes {
            title {
              romaji
              english
            }
          }
        }
      }
    }
  `;

  const data = await anilistQuery(q, { search: nombre });
  const char = data?.data?.Character;

  if (!char) return null;

  const animename = char.media?.nodes?.[0]?.title?.english || char.media?.nodes?.[0]?.title?.romaji || 'Unknown Series';

  return {
    anilist_id: char.id,
    nombre: char.name.full,
    serie: animename,
    imagen: char.image.large,
    rareza: calcularRareza(char.favourites),
    favoritos: char.favourites
  };
}
