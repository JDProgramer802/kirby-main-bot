// ─────────────────────────────────────────────────────────────────────────────
// src/lib/config.js — Configuración global del Bot Kirby Dream
// ─────────────────────────────────────────────────────────────────────────────
import 'dotenv/config';

const config = {
  // Prefijo de comandos
  prefijo: process.env.PREFIJO || '/',

  // Información del bot
  botNombre: process.env.BOT_NAME || 'Kirby Dream',
  botDev: process.env.BOT_DEV || 'Dream Kirby Developer',

  // Número del dueño (formato: 5491100000000 sin @s.whatsapp.net)
  ownerNumero: process.env.OWNER_NUMBER || '',
  get ownerJid() {
    if (!this.ownerNumero) return '';
    return this.ownerNumero.includes('@') ? this.ownerNumero : `${this.ownerNumero}@s.whatsapp.net`;
  },

  // Base de datos PostgreSQL (URL Connection String)
  db: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/kirby_bot',
  },

  // ImgBB
  imgbbApiKey: process.env.IMGBB_API_KEY || '',

  // ApiCausas
  apicausasKey: process.env.APICAUSAS_KEY || '',

  // Zona horaria
  timezone: process.env.TIMEZONE || 'America/Lima',

  // Modos globales
  modoPublico: process.env.MODO_PUBLICO === 'true',
  nsfwGlobal: process.env.NSFW_GLOBAL === 'true',

  // ─── Economía ─────────────────────────────────────────────────────────────
  economia: {
    monedaEmoji: '✧𝓚',
    monedaNombre: 'Kirby Coins',
    balanceInicial: 500,
    cooldownWork: 3600,      // segundos (1 hora)
    cooldownDaily: 86400,    // segundos (24 horas)
    cooldownCrime: 1800,     // segundos (30 min)
    cooldownSlut: 1800,
    cooldownSteal: 1800,
  },

  // ─── Gacha ────────────────────────────────────────────────────────────────
  gacha: {
    precioRoll: 150,
    precioClaim: 200,
    precioBuyChar: 500,
    cooldownRoll: 60,        // segundos
    cooldownClaim: 300,
  },

  // ─── Niveles ──────────────────────────────────────────────────────────────
  xpPorMensaje: 5,
  xpCoeficiente: 100,       // XP necesaria: nivel² * coeficiente

  // ─── Banners ──────────────────────────────────────────────────────────────
  bannerDefault: 'https://i.ibb.co/kirby-default-banner',

  // ─── Rutas Binarias (Descargas Locales) ────────────────────────────────────
  paths: {
    ffmpeg: 'C:\\ffmpeg\\bin\\ffmpeg.exe',
    ytdlp: 'C:\\ffmpeg\\bin\\yt-dlp.exe',
  },
};

export default config;
