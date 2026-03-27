// ────────────────────────────────────────────────────────────────
// database.js
// Data Access Layer (PostgreSQL)
// Kirby Dream Bot — Arquitectura escalable y optimizada
// ────────────────────────────────────────────────────────────────

import pg from 'pg';
import config from './config.js';

const { Pool } = pg;

// ────────────────────────────────────────────────────────────────
// Connection Pool Configuration
// ────────────────────────────────────────────────────────────────
// Pool global compartido entre todos los subbots.
// Minimiza overhead y mejora el throughput.
//
const pool = new Pool({
  connectionString: config.db.url,
  max: 30, // Incrementado para balancear carga de subbots
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000, // Incrementado para evitar timeouts prematuros
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('[DB] Pool error:', err.message);
});

// ────────────────────────────────────────────────────────────────
// In-Memory Cache Layer
// ────────────────────────────────────────────────────────────────
// Cache TTL para reducir lecturas repetidas en queries críticas.
//
export const cache = {
  usuarios: new Map(),
  grupos: new Map(),
  economia: new Map(),
  botConfig: new Map(),
  subbots: new Map()
};

const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 1000; // Limite de elementos por cache para evitar consumo excesivo de RAM

function setCache(map, key, value) {
  // Si el cache excede el límite, eliminamos la primera entrada (la más antigua)
  if (map.size >= MAX_CACHE_SIZE) {
    const firstKey = map.keys().next().value;
    map.delete(firstKey);
  }

  map.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL
  });
}

function getCache(map, key) {
  const entry = map.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    map.delete(key);
    return null;
  }

  return entry.value;
}

// Limpieza automática del cache
setInterval(() => {
  const now = Date.now();

  for (const map of Object.values(cache)) {
    for (const [key, entry] of map.entries()) {
      if (now > entry.expiresAt) {
        map.delete(key);
      }
    }
  }
}, 60000);

// ────────────────────────────────────────────────────────────────
// Query Executor
// ────────────────────────────────────────────────────────────────
/**
 * Ejecutor de queries con reintentos para errores transitorios
 */
export async function query(sql, params = [], retries = 3) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await pool.query(sql, params);
    } catch (err) {
      attempt++;
      // Errores transitorios comunes (ej. pérdida de conexión temporal)
      const isTransient = ['ECONNRESET', 'ETIMEDOUT', '57P01'].includes(err.code);

      if (isTransient && attempt < retries) {
        const delay = Math.pow(2, attempt) * 100; // Exponential backoff: 200ms, 400ms...
        console.warn(`[DB] Reintentando query (${attempt}/${retries}) tras error: ${err.message}. Reintentando en ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        continue;
      }

      console.error('[DB] Query error:', err.message, '| SQL:', sql.slice(0, 100));
      throw err;
    }
  }
}

// ────────────────────────────────────────────────────────────────
// Database Schema Initialization
// ────────────────────────────────────────────────────────────────
export async function inicializarDB() {
  console.log('[DB] Probando conexión...');
  let client;
  try {
    client = await pool.connect();
    console.log('[DB] Conexión establecida correctamente.');
  } catch (err) {
    console.error('[DB] Error de conexión crítico:', err.message);
    console.log('[DB] Tip: Verifica que tu DATABASE_URL sea correcta y que tu base de datos esté activa.');
    process.exit(1);
  }

  console.log('[DB] Iniciando esquema (tablas y migraciones)...');

  try {
    // Aumentar el timeout para la inicialización del esquema (60 segundos o desactivarlo con 0)
    await client.query('SET statement_timeout = 60000');

    const queries = [
      // Usuarios
      `CREATE TABLE IF NOT EXISTS usuarios (
        jid TEXT PRIMARY KEY,
        nombre TEXT,
        xp BIGINT DEFAULT 0,
        nivel INT DEFAULT 1,
        mensajes INT DEFAULT 0,
        descripcion TEXT DEFAULT '',
        favorito TEXT DEFAULT '',
        genero TEXT DEFAULT '',
        cumpleanos TEXT DEFAULT '',
        banner TEXT DEFAULT '',
        pareja TEXT DEFAULT NULL,
        ultima_act TIMESTAMPTZ DEFAULT NOW()
      )`,

      // Economía
      `CREATE TABLE IF NOT EXISTS economia (
        jid TEXT PRIMARY KEY,
        monedas BIGINT DEFAULT 500,
        banco BIGINT DEFAULT 0,
        ultimo_daily TIMESTAMPTZ,
        ultimo_work TIMESTAMPTZ,
        ultimo_crime TIMESTAMPTZ,
        ultimo_slut TIMESTAMPTZ,
        ultimo_steal TIMESTAMPTZ,
        ultimo_roll TIMESTAMPTZ,
        ultimo_mine TIMESTAMPTZ,
        ultimo_fish TIMESTAMPTZ,
        ultimo_hunt TIMESTAMPTZ,
        ultimo_explore TIMESTAMPTZ,
        ultimo_beg TIMESTAMPTZ,
        ultimo_weekly TIMESTAMPTZ,
        ultimo_loteria TIMESTAMPTZ,
        total_ganado BIGINT DEFAULT 0,
        total_perdido BIGINT DEFAULT 0
      )`,

      `ALTER TABLE economia ADD COLUMN IF NOT EXISTS ultimo_mine TIMESTAMPTZ`,
      `ALTER TABLE economia ADD COLUMN IF NOT EXISTS ultimo_fish TIMESTAMPTZ`,
      `ALTER TABLE economia ADD COLUMN IF NOT EXISTS ultimo_hunt TIMESTAMPTZ`,
      `ALTER TABLE economia ADD COLUMN IF NOT EXISTS ultimo_explore TIMESTAMPTZ`,
      `ALTER TABLE economia ADD COLUMN IF NOT EXISTS ultimo_beg TIMESTAMPTZ`,
      `ALTER TABLE economia ADD COLUMN IF NOT EXISTS ultimo_weekly TIMESTAMPTZ`,
      `ALTER TABLE economia ADD COLUMN IF NOT EXISTS ultimo_loteria TIMESTAMPTZ`,

      // Configuración de grupos
      `CREATE TABLE IF NOT EXISTS grupos (
        jid TEXT PRIMARY KEY,
        bienvenida BOOLEAN DEFAULT true,
        msg_bienvenida TEXT DEFAULT '',
        despedida BOOLEAN DEFAULT true,
        msg_despedida TEXT DEFAULT '',
        antilink BOOLEAN DEFAULT false,
        nsfw BOOLEAN DEFAULT false,
        economia_activa BOOLEAN DEFAULT true,
        gacha_activo BOOLEAN DEFAULT true,
        solo_admin BOOLEAN DEFAULT false,
        bot_activo BOOLEAN DEFAULT true,
        limite_warns INT DEFAULT 3,
        imagen_grupo TEXT DEFAULT '',
        msg_claims TEXT DEFAULT '',
        banner_bienvenida TEXT DEFAULT '',
        banner_despedida TEXT DEFAULT '',
        creado TIMESTAMPTZ DEFAULT NOW()
      )`,

      `ALTER TABLE grupos ADD COLUMN IF NOT EXISTS banner_bienvenida TEXT DEFAULT ''`,
      `ALTER TABLE grupos ADD COLUMN IF NOT EXISTS banner_despedida TEXT DEFAULT ''`,

      // Pool de Mascotas Disponibles
      `CREATE TABLE IF NOT EXISTS mascotas_pool (
        id SERIAL PRIMARY KEY,
        nombre_personaje TEXT UNIQUE NOT NULL,
        imagen_url TEXT NOT NULL,
        atq INT DEFAULT 10,
        def INT DEFAULT 10,
        creado_en TIMESTAMPTZ DEFAULT NOW()
      )`,

      // Tabla de Mascotas (Usuarios)
      `CREATE TABLE IF NOT EXISTS mascotas (
        id SERIAL PRIMARY KEY,
        jid_usuario TEXT NOT NULL,
        nombre TEXT NOT NULL,
        tipo TEXT NOT NULL,
        imagen_url TEXT DEFAULT '',
        nivel INT DEFAULT 1,
        experiencia INT DEFAULT 0,
        hambre INT DEFAULT 100,
        felicidad INT DEFAULT 100,
        salud INT DEFAULT 100,
        poder_ataque INT DEFAULT 10,
        poder_defensa INT DEFAULT 5,
        ultima_comida TIMESTAMPTZ DEFAULT NOW(),
        ultimo_juego TIMESTAMPTZ DEFAULT NOW(),
        fecha_adopcion TIMESTAMPTZ DEFAULT NOW()
      )`,

      // Advertencias
      `CREATE TABLE IF NOT EXISTS advertencias (
        id SERIAL PRIMARY KEY,
        jid_grupo TEXT NOT NULL,
        jid_usuario TEXT NOT NULL,
        razon TEXT DEFAULT '',
        fecha TIMESTAMPTZ DEFAULT NOW()
      )`,

      // Gacha
      `CREATE TABLE IF NOT EXISTS personajes_disponibles (
        id SERIAL PRIMARY KEY,
        anilist_id INT UNIQUE,
        nombre TEXT NOT NULL,
        nombre_romaji TEXT,
        serie TEXT,
        imagen_url TEXT,
        video_url TEXT,
        rareza INT DEFAULT 3,
        en_venta BOOLEAN DEFAULT false,
        precio_venta BIGINT DEFAULT 0
      )`,

      `CREATE TABLE IF NOT EXISTS harem (
        id SERIAL PRIMARY KEY,
        jid_usuario TEXT NOT NULL,
        personaje_id INT REFERENCES personajes_disponibles(id),
        favorito BOOLEAN DEFAULT false,
        fecha_obtencion TIMESTAMPTZ DEFAULT NOW()
      )`,

      `CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        jid_origen TEXT NOT NULL,
        jid_destino TEXT NOT NULL,
        harem_id_origen INT,
        harem_id_dest INT,
        estado TEXT DEFAULT 'pendiente',
        fecha TIMESTAMPTZ DEFAULT NOW()
      )`,

      // Conteo de mensajes
      `CREATE TABLE IF NOT EXISTS mensajes_grupo (
        jid_grupo TEXT NOT NULL,
        jid_usuario TEXT NOT NULL,
        cantidad INT DEFAULT 0,
        ultima_vez TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (jid_grupo, jid_usuario)
      )`,

      // Stickers
      `CREATE TABLE IF NOT EXISTS packs_stickers (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        descripcion TEXT DEFAULT '',
        jid_creador TEXT NOT NULL,
        publico BOOLEAN DEFAULT false,
        favoritos INT DEFAULT 0,
        fecha_creacion TIMESTAMPTZ DEFAULT NOW()
      )`,

      `CREATE TABLE IF NOT EXISTS stickers_items (
        id SERIAL PRIMARY KEY,
        pack_id INT REFERENCES packs_stickers(id) ON DELETE CASCADE,
        url_imagen TEXT NOT NULL,
        agregado_en TIMESTAMPTZ DEFAULT NOW()
      )`,

      // Sesiones
      `CREATE TABLE IF NOT EXISTS auth_keys (
        id TEXT PRIMARY KEY,
        tipo TEXT NOT NULL,
        datos TEXT NOT NULL
      )`,

      // Solo ejecutar ALTER si el tipo no es TEXT (evita escaneos innecesarios)
      `DO $$
       BEGIN
         IF EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_name = 'auth_keys' AND column_name = 'datos' AND data_type != 'text'
         ) THEN
           ALTER TABLE auth_keys ALTER COLUMN datos TYPE TEXT USING datos::TEXT;
         END IF;
       END $$;`,

      // Configuración global
      `CREATE TABLE IF NOT EXISTS bot_config (
        clave TEXT PRIMARY KEY,
        valor TEXT NOT NULL
      )`,

      // Subbots
      `CREATE TABLE IF NOT EXISTS subbots (
        jid TEXT PRIMARY KEY,
        jid_owner TEXT NOT NULL,
        nombre TEXT,
        estado TEXT DEFAULT 'desconectado',
        moneda TEXT DEFAULT 'coins',
        banner TEXT DEFAULT '',
        creado TIMESTAMPTZ DEFAULT NOW()
      )`,

      `ALTER TABLE subbots ADD COLUMN IF NOT EXISTS jid_owner TEXT`,
      `ALTER TABLE subbots ADD COLUMN IF NOT EXISTS nombre TEXT`,
      `ALTER TABLE subbots ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'desconectado'`,
      `ALTER TABLE subbots ADD COLUMN IF NOT EXISTS moneda TEXT DEFAULT 'coins'`,
      `ALTER TABLE subbots ADD COLUMN IF NOT EXISTS banner TEXT DEFAULT ''`,
      `ALTER TABLE subbots ADD COLUMN IF NOT EXISTS bienvenida_enviada BOOLEAN DEFAULT false`,

      // Índices para mejorar rendimiento en búsquedas comunes
      `CREATE INDEX IF NOT EXISTS idx_harem_usuario ON harem(jid_usuario)`,
      `CREATE INDEX IF NOT EXISTS idx_harem_personaje ON harem(personaje_id)`,
      `CREATE INDEX IF NOT EXISTS idx_advertencias ON advertencias(jid_grupo, jid_usuario)`,
      `CREATE INDEX IF NOT EXISTS idx_mensajes ON mensajes_grupo(jid_grupo, jid_usuario)`,
      `CREATE INDEX IF NOT EXISTS idx_mascotas_usuario ON mascotas(jid_usuario)`,
      `CREATE INDEX IF NOT EXISTS idx_trades_origen ON trades(jid_origen)`,
      `CREATE INDEX IF NOT EXISTS idx_trades_destino ON trades(jid_destino)`,
      `CREATE INDEX IF NOT EXISTS idx_stickers_pack ON stickers_items(pack_id)`,
      `CREATE INDEX IF NOT EXISTS idx_subbots_owner ON subbots(jid_owner)`
    ];

    for (let i = 0; i < queries.length; i++) {
      try {
        await client.query(queries[i]);
      } catch (err) {
        console.error(`[DB] Error en query #${i + 1}:`, err.message);
        // Algunos errores de ALTER TABLE son esperados si ya existen columnas con otro tipo
      }
    }

    // Restaurar el timeout a su valor original por defecto (usualmente 0 o configurado en el pool)
    await client.query('SET statement_timeout = 0');

  } catch (err) {
    console.error('[DB] Error durante la inicialización del esquema:', err.message);
  } finally {
    if (client) client.release();
  }

  console.log('[DB] Esquema inicializado correctamente.');
}


// ────────────────────────────────────────────────────────────────
// Repositories (Usuarios, Economía, Grupos, Config)
// ────────────────────────────────────────────────────────────────

export async function obtenerUsuario(jid) {
  // Incrementar XP y mensajes automáticamente al obtener el usuario
  // El nivel se recalcula dinámicamente: floor(sqrt(xp / coeficiente)) + 1
  const xpGanada = config.xpPorMensaje || 5;
  const coeficiente = config.xpCoeficiente || 100;

  const res = await query(
    `INSERT INTO usuarios (jid, xp, mensajes, nivel)
     VALUES ($1, $2, 1, 1)
     ON CONFLICT (jid)
     DO UPDATE SET
       xp = usuarios.xp + $2,
       mensajes = usuarios.mensajes + 1,
       nivel = floor(sqrt((usuarios.xp + $2) / $3)) + 1,
       ultima_act = NOW()
     RETURNING *`,
    [jid, xpGanada, coeficiente]
  );

  const user = res.rows[0];
  setCache(cache.usuarios, jid, user);
  return user;
}

export async function obtenerEconomia(jid) {
  const cached = getCache(cache.economia, jid);
  if (cached) return cached;

  const res = await query(
    `INSERT INTO economia (jid)
     VALUES ($1)
     ON CONFLICT (jid) DO UPDATE SET jid = EXCLUDED.jid
     RETURNING *`,
    [jid]
  );

  const data = res.rows[0];
  setCache(cache.economia, jid, data);
  return data;
}

export async function actualizarMonedas(jid, cantidad) {
  await query(
    `UPDATE economia SET monedas = monedas + $2 WHERE jid = $1`,
    [jid, cantidad]
  );
  cache.economia.delete(jid);
}

export async function actualizarBanco(jid, cantidad) {
  await query(
    `UPDATE economia SET banco = banco + $2 WHERE jid = $1`,
    [jid, cantidad]
  );
  // Invalidar y forzar la recarga del caché para este usuario
  cache.economia.delete(jid);
  await obtenerEconomia(jid);
}

/**
 * Descuenta monedas de forma ATÓMICA directamente en SQL.
 * Prioriza monedas en mano y usa el banco si es necesario.
 * @throws Error si el saldo total es insuficiente.
 */
export async function descontarMonedas(jid, cantidad) {
  const res = await query(
    `UPDATE economia
     SET
       monedas = CASE
         WHEN monedas >= $2 THEN monedas - $2
         ELSE 0
       END,
       banco = CASE
         WHEN monedas >= $2 THEN banco
         ELSE banco - ($2 - monedas)
       END
     WHERE jid = $1 AND (monedas + banco) >= $2
     RETURNING *`,
    [jid, cantidad]
  );

  if (res.rowCount === 0) {
    throw new Error('No tienes suficientes monedas en total para realizar esta operación.');
  }

  cache.economia.delete(jid);
  return true;
}

const ALLOWED_GROUP_FIELDS = [
  'bienvenida',
  'msg_bienvenida',
  'despedida',
  'msg_despedida',
  'antilink',
  'nsfw',
  'economia_activa',
  'gacha_activo',
  'solo_admin',
  'bot_activo',
  'limite_warns',
  'imagen_grupo',
  'msg_claims',
  'banner_bienvenida',
  'banner_despedida'
];

export async function obtenerGrupo(jid) {
  const cached = getCache(cache.grupos, jid);
  if (cached) return cached;

  const res = await query(
    `INSERT INTO grupos (jid)
     VALUES ($1)
     ON CONFLICT (jid) DO UPDATE SET jid = EXCLUDED.jid
     RETURNING *`,
    [jid]
  );

  const data = res.rows[0];
  setCache(cache.grupos, jid, data);
  return data;
}

export async function actualizarGrupo(jid, campo, valor) {
  if (!ALLOWED_GROUP_FIELDS.includes(campo)) {
    throw new Error('Invalid field');
  }

  await query(
    `UPDATE grupos SET ${campo} = $2 WHERE jid = $1`,
    [jid, valor]
  );
  cache.grupos.delete(jid);
}

export async function getBotConfig(clave, defecto = '') {
  const cached = getCache(cache.botConfig, clave);
  if (cached) return cached;

  const res = await query(
    `SELECT valor FROM bot_config WHERE clave = $1`,
    [clave]
  );

  const value = res.rows.length ? res.rows[0].valor : defecto;
  setCache(cache.botConfig, clave, value);

  return value;
}

export async function obtenerSubbot(jid) {
  const cached = getCache(cache.subbots, jid);
  if (cached) return cached;

  const res = await query(`SELECT * FROM subbots WHERE jid = $1`, [jid]);
  const data = res.rows[0] || null;

  if (data) setCache(cache.subbots, jid, data);
  return data;
}

export async function setBotConfig(clave, valor) {
  await query(
    `INSERT INTO bot_config (clave, valor)
     VALUES ($1, $2)
     ON CONFLICT (clave)
     DO UPDATE SET valor = $2`,
    [clave, valor]
  );
  cache.botConfig.delete(clave);
}

// ────────────────────────────────────────────────────────────────
// Mascotas Repository
// ────────────────────────────────────────────────────────────────

export async function obtenerMascota(jid, id = null) {
  if (id) {
    const res = await query(`SELECT * FROM mascotas WHERE jid_usuario = $1 AND id = $2`, [jid, id]);
    return res.rows[0] || null;
  }
  const res = await query(`SELECT * FROM mascotas WHERE jid_usuario = $1 ORDER BY id ASC LIMIT 1`, [jid]);
  return res.rows[0] || null;
}

export async function obtenerMascotas(jid) {
  const res = await query(`SELECT * FROM mascotas WHERE jid_usuario = $1 ORDER BY id ASC`, [jid]);
  return res.rows;
}

export async function crearMascota(jid, nombre, tipo, imagen_url = '', atq = 10, def = 10) {
  const res = await query(
    `INSERT INTO mascotas (jid_usuario, nombre, tipo, imagen_url, poder_ataque, poder_defensa)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [jid, nombre, tipo, imagen_url, atq, def]
  );
  return res.rows[0];
}

export async function actualizarMascota(jid, campos = {}, id = null) {
  const keys = Object.keys(campos);
  if (keys.length === 0) return;

  const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
  const values = Object.values(campos);

  if (id) {
    await query(
      `UPDATE mascotas SET ${setClause} WHERE jid_usuario = $1 AND id = $${keys.length + 2}`,
      [jid, ...values, id]
    );
  } else {
    await query(
      `UPDATE mascotas SET ${setClause} WHERE jid_usuario = $1`,
      [jid, ...values]
    );
  }
}

export async function eliminarMascota(jid) {
  await query(`DELETE FROM mascotas WHERE jid_usuario = $1`, [jid]);
}

export async function obtenerTopMascotas(limit = 10) {
  const res = await query(
    `SELECT * FROM mascotas ORDER BY nivel DESC, experiencia DESC LIMIT $1`,
    [limit]
  );
  return res.rows;
}

export default pool;
