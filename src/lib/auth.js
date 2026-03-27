import { BufferJSON, initAuthCreds } from '@itsukichann/baileys';
import { query } from './database.js';
import { log } from './utils.js';

export async function usarAuthPostgres(sesionId = 'main') {
  const authCache = new Map();

  const flushQueue = {
    write: [],
    delete: new Set(),
    timer: null
  };

  const flushAuthBatch = async () => {
    flushQueue.timer = null;
    let toWrite = flushQueue.write.splice(0, flushQueue.write.length);
    const toDelete = Array.from(flushQueue.delete);
    flushQueue.delete.clear();

    // Deduplicar por id, dejando el valor más reciente (última llamada wins)
    const writeMap = new Map();
    for (const item of toWrite) {
      if (!toDelete.includes(item.id)) {
        writeMap.set(item.id, item);
      }
    }
    toWrite = Array.from(writeMap.values());

    if (toWrite.length > 0) {
      const chunkSize = 20;
      for (let i = 0; i < toWrite.length; i += chunkSize) {
        const chunk = toWrite.slice(i, i + chunkSize);
        let attempt = 0;
        const maxAttempts = 3;

        while (attempt < maxAttempts) {
          try {
            await query(
              `INSERT INTO auth_keys (id, tipo, datos)
               SELECT * FROM UNNEST($1::text[], $2::text[], $3::text[])
               ON CONFLICT (id) DO UPDATE SET datos = EXCLUDED.datos`,
              [chunk.map(c => c.id), chunk.map(c => c.tipo), chunk.map(c => c.datos)]
            );
            break;
          } catch (e) {
            attempt++;
            const isTimeout = e.message?.toLowerCase().includes('timeout') || e.code === 'ETIMEDOUT';
            if (attempt >= maxAttempts) {
              log('ERROR', `[Auth] Error escribiendo chunk (intento ${attempt}): ${e.message}`);
              break;
            }
            if (isTimeout) {
              const waitMs = 200 * attempt;
              log('WARN', `[Auth] Timeout escribiendo chunk, reintentando en ${waitMs}ms (intento ${attempt}/${maxAttempts})`);
              await new Promise(res => setTimeout(res, waitMs));
            } else {
              log('ERROR', `[Auth] Error escribiendo chunk: ${e.message}`);
              break;
            }
          }
        }
      }
    }

    if (toDelete.length > 0) {
      try {
        await query(`DELETE FROM auth_keys WHERE id = ANY($1)`, [toDelete]);
      } catch (e) {
        log('ERROR', `[Auth] Error eliminando keys en batch: ${e.message}`);
      }
    }
  };

  const scheduleFlush = () => {
    if (flushQueue.timer) return;
    flushQueue.timer = setTimeout(flushAuthBatch, 50);
  };

  const leerDato = async (tipo) => {
    try {
      const res = await query(
        `SELECT datos FROM auth_keys WHERE id = $1`,
        [`${sesionId}_${tipo}`]
      );
      if (!res.rows[0]?.datos) return null;

      const datosRaw = res.rows[0].datos;
      return typeof datosRaw === 'string'
        ? JSON.parse(datosRaw, BufferJSON.reviver)
        : datosRaw;
    } catch (e) {
      log('ERROR', `[Auth] Error al leer "${tipo}": ${e.message}`);
      return null;
    }
  };

  const escribirDato = async (tipo, datos) => {
    try {
      const jsonStr = JSON.stringify(datos, BufferJSON.replacer);
      // ✅ FIX: No actualizar si los datos son idénticos para reducir carga en DB
      await query(
        `INSERT INTO auth_keys (id, tipo, datos)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE
         SET datos = EXCLUDED.datos
         WHERE auth_keys.datos IS DISTINCT FROM EXCLUDED.datos`,
        [`${sesionId}_${tipo}`, tipo, jsonStr]
      );
    } catch (e) {
      log('ERROR', `[Auth] Error al escribir "${tipo}": ${e.message}`);
    }
  };

  // ─── Credenciales ────────────────────────────────────────────────
  let creds = await leerDato('creds');

  if (!creds) {
    creds = initAuthCreds();
    await escribirDato('creds', creds); // ✅ FIX: guardar inmediatamente para no perderlas
    log('INFO', `[Auth] Nuevas credenciales generadas para: ${sesionId}`);
  } else {
    log('INFO', `[Auth] Credenciales cargadas para: ${sesionId}`);
  }

  // ─── State ───────────────────────────────────────────────────────
  const state = {
    creds,
    keys: {
      get: async (tipo, ids) => {
        const datos = {};
        if (!ids?.length) return datos; // ✅ FIX: evitar query vacío

        try {
          const idsBusqueda = ids.map(id => `${sesionId}_${tipo}-${id}`);

          // Leer valores desde cache en memoria y completar con DB si falta alguno.
          const missingIds = [];
          idsBusqueda.forEach((fullId, index) => {
            if (authCache.has(fullId)) {
              datos[ids[index]] = authCache.get(fullId);
            } else {
              missingIds.push(fullId);
            }
          });

          if (missingIds.length > 0) {
            const res = await query(
              `SELECT id, datos FROM auth_keys WHERE id = ANY($1)`,
              [missingIds]
            );

            for (const row of res.rows) {
              const realId = row.id.replace(`${sesionId}_${tipo}-`, '');
              try {
                const parsed = typeof row.datos === 'string'
                  ? JSON.parse(row.datos, BufferJSON.reviver)
                  : row.datos;
                datos[realId] = parsed;
                authCache.set(row.id, parsed);
              } catch (parseErr) {
                log('ERROR', `[Auth] Error parseando key ${realId}: ${parseErr.message}`);
              }
            }
          }
        } catch (e) {
          log('ERROR', `[Auth] Error en get keys (${tipo}): ${e.message}`);
        }
        return datos;
      },

      set: async (datos) => {
        if (!datos || typeof datos !== 'object') return; // ✅ FIX: guard clause

        const toWrite = [];
        const toDelete = [];

        for (const [tipo, valores] of Object.entries(datos)) {
          if (!valores) continue;
          for (const [id, valor] of Object.entries(valores)) {
            const fullId = `${sesionId}_${tipo}-${id}`;
            if (valor != null) {
              toWrite.push({
                id: fullId,
                tipo,
                datos: JSON.stringify(valor, BufferJSON.replacer)
              });
            } else {
              toDelete.push(fullId);
            }
          }
        }

        // Escrituras en chunks con menor presión sobre el pool
        // Actualizar cache local inmediatamente para que la respuesta no dependa de DB.
        toWrite.forEach(item => authCache.set(item.id, JSON.parse(item.datos, BufferJSON.reviver)));
        toDelete.forEach(id => authCache.delete(id));

        // Encolar para escritura en background y seguir rápido.
        if (toWrite.length > 0) flushQueue.write.push(...toWrite);
        toDelete.forEach(id => flushQueue.delete.add(id));
        scheduleFlush();

        // Retornar inmediatamente, la escritura se hace asíncrona.
        return;
      },
    },
  };

  const saveCreds = async () => {
    await escribirDato('creds', state.creds);
  };

  return { state, saveCreds };
}
