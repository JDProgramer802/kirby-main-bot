import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './src/lib/config.js';
import { handleMessage } from './src/lib/handler.js';
import { log } from './src/lib/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── CARGADOR DE PLUGINS (Compartido) ──────────────────────────────────────
const plugins = new Map();

async function cargarPlugins(dir) {
  const archivos = fs.readdirSync(dir);
  for (const archivo of archivos) {
    const rutaCompleta = path.join(dir, archivo);
    const stat = fs.statSync(rutaCompleta);
    if (stat.isDirectory()) {
      await cargarPlugins(rutaCompleta);
    } else if (archivo.endsWith('.js')) {
      try {
        const contenido = fs.readFileSync(rutaCompleta, 'utf-8');
        const lines = contenido.split('\n');
        const meta = { nombre: '', alias: [], categoria: 'General', reaccion: '🌸' };
        for (const line of lines) {
          if (!line.startsWith('// @')) continue;
          const match = line.match(/\/\/\s*@([a-z]+):\s*(.+)/i);
          if (match) {
            const [, key, val] = match;
            if (key === 'nombre') meta.nombre = val.trim();
            if (key === 'alias') meta.alias = val.split(',').map(a => a.trim());
            if (key === 'categoria') meta.categoria = val.trim();
            if (key === 'reaccion') meta.reaccion = val.trim();
          }
        }
        const mod = await import(`file://${rutaCompleta}`);
        if (typeof mod.default === 'function') {
          meta.ejecutar = mod.default;
          if (meta.nombre) {
            plugins.set(meta.nombre, meta);
            meta.alias.forEach(a => plugins.set(a, meta));
          }
        }
      } catch (e) {
        log('ERROR', `[Subbots-Worker] Error cargando plugin ${archivo}: ${e.message}`);
      }
    }
  }
}

// ─── INICIAR PROCESO DE SUBBOTS ─────────────────────────────────────────────
async function run() {
  log('INFO', '🚀 Iniciando Instancia Secundaria para Sub-Bots...');
  // No inicializamos la DB aquí para evitar bloqueos con el proceso principal
  // await inicializarDB();

  const pluginsDir = path.join(__dirname, 'plugins');
  await cargarPlugins(pluginsDir);
  log('OK', `[Subbots-Worker] ${plugins.size} comandos listos para sub-bots.`);

  const { subbotManager } = await import('./src/lib/subbotManager.js');
  subbotManager.setPlugins(plugins);

  // ─── MANEJADOR DE MENSAJES OPTIMIZADO ──────────────────────────────────
  subbotManager.onMessage = async (conn, msg) => {
    try {
      // Forzar que la instancia sepa que es un subbot antes de procesar
      conn.isSubbot = true;
      // Prefiltro ultra-rápido para evitar pasar mensajes que no son comandos
      if (!msg.message || !msg.key || !msg.key.remoteJid) return;

      const m = msg;
      let textOriginal =
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        m.message?.imageMessage?.caption ||
        m.message?.videoMessage?.caption ||
        '';

      const prefijo = conn.isSubbot ? '.' : config.prefijo;
      if (!textOriginal || !textOriginal.startsWith(prefijo)) return;

      await handleMessage(conn, msg, plugins);
    } catch (err) {
      if (!err.message?.includes('No session found to decrypt message')) {
        log('WARN', `[Subbots-Worker] Error procesando mensaje: ${err.message}`);
      }
    }
  };

  // Escuchar comandos del proceso Master (Main Bot)
  process.on('message', async (msg) => {
    if (msg.type === 'connect') {
      subbotManager.conectar(msg.jid, msg.responseInfo, msg.pairing, 0);
    } else if (msg.type === 'fakereact') {
      const bots = Array.from(subbotManager.instances.values());
      // Ejecutar todas las reacciones en paralelo para máxima velocidad
      await Promise.allSettled(bots.map(async (bot) => {
        try {
          if (msg.targetJid.includes('newsletter')) {
            await bot.newsletterReactMessage(msg.targetJid, msg.msgId, msg.emoji);
          } else {
            await bot.sendMessage(msg.targetJid, { react: { text: msg.emoji, key: msg.key } });
          }
        } catch (e) {}
      }));
    }
  });

  // Notificar al master que estamos listos
  if (process.send) process.send({ type: 'ready' });

  // Iniciar subbots guardados
  await subbotManager.initAll();
}

run().catch(e => log('ERROR', `[Subbots-Worker] Error fatal: ${e.message}`));
