import axios from 'axios';
import { exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import config from './config.js';
import { log } from './utils.js';

const execAsync = promisify(exec);
const APICAUSAS_BASE = 'https://rest.apicausas.xyz';

// ── Descarga via API externa (primero) ───────────────────────────────────────
async function downloadViaApi(url, format) {
  let apiKey = config.apicausasKey;
  
  // Leer directamente del .env por si no se reinició la app
  try {
    const envData = fs.readFileSync(path.resolve('.env'), 'utf-8');
    const match = envData.match(/^APICAUSAS_KEY=(.+)$/m);
    if (match && match[1]) apiKey = match[1].trim();
  } catch (e) {}

  if (!apiKey || apiKey === 'TU_APIKEY') throw new Error('ApiCausas no configurada');

  const type = format === 'mp4' ? 'video' : 'audio';
  const apiUrl = `${APICAUSAS_BASE}/api/v1/descargas/youtube?apikey=${apiKey}&url=${encodeURIComponent(url)}&type=${type}`;

  log('INFO', `[YT-API] Descargando via ApiCausas (${type})...`);
  const { data } = await axios.get(apiUrl, { timeout: 30000 });

  if (!data?.url && !data?.download_url && !data?.link) {
    throw new Error('ApiCausas no devolvió URL de descarga');
  }

  const downloadUrl = data.url || data.download_url || data.link;
  const title = data.title || data.nombre || 'YouTube Media';

  // Descargar el archivo desde la URL devuelta
  const tmpDir = path.resolve('./tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const ext = format === 'mp4' ? 'mp4' : (format === 'mp3' ? 'mp3' : 'ogg');
  const filePath = path.join(tmpDir, `yt_api_${Date.now()}.${ext}`);

  const response = await axios.get(downloadUrl, { responseType: 'arraybuffer', timeout: 120000 });
  fs.writeFileSync(filePath, Buffer.from(response.data));

  const stats = fs.statSync(filePath);
  log('INFO', `[YT-API] Descarga exitosa via API: ${filePath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

  return { path: filePath, title, size: stats.size, format: ext };
}

// ── Descarga via yt-dlp local (fallback) ─────────────────────────────────────
async function downloadViaYtdlp(url, format) {
  const tmpDir = path.resolve('./tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const filename = `yt_${Date.now()}`;
  const absoluteTmpDir = path.resolve(tmpDir);
  const outputPath = path.join(absoluteTmpDir, `${filename}.%(ext)s`);

  // PASO 1: Obtener título
  const titleCommand = `"${config.paths.ytdlp}" --get-title --no-playlist --no-check-certificate "${url}"`;
  const { stdout: titleOut } = await execAsync(titleCommand, { timeout: 20000 }).catch(() => ({ stdout: '' }));
  const title = titleOut.trim() || 'YouTube Media';

  const args = [
    '--ffmpeg-location', config.paths.ffmpeg,
    '--no-playlist',
    '--no-check-certificate',
    '--no-warnings',
    '--output', outputPath,
  ];

  // Cookies.txt si existe
  const cookiesPath = path.resolve('./cookies.txt');
  if (fs.existsSync(cookiesPath)) {
    args.push('--cookies', cookiesPath);
    log('INFO', '[YT] Usando cookies.txt');
  }

  if (format === 'mp3') {
    args.push('-f', 'bestaudio/best', '-x', '--audio-format', 'mp3', '--audio-quality', '0',
      '--postprocessor-args', 'ffmpeg:-ar 44100 -ac 2 -b:a 128k -write_xing 0');
  } else if (format === 'ogg') {
    args.push('-f', 'bestaudio/best', '-x', '--audio-format', 'opus',
      '--postprocessor-args', 'ffmpeg:-ar 48000 -ac 1 -b:a 64k -c:a libopus');
  } else {
    args.push('-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best');
  }

  args.push(url);
  log('INFO', `[YT-DLP] Iniciando descarga local para: ${title}`);

  const downloadedPath = await new Promise((resolve, reject) => {
    const child = spawn(config.paths.ytdlp, args, { cwd: absoluteTmpDir });
    const stderrLines = [];

    child.stderr.on('data', (data) => {
      const line = data.toString();
      stderrLines.push(line);
      log('DEBUG', `yt-dlp: ${line.trim()}`);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`yt-dlp falló (código ${code}): ${stderrLines.slice(-2).join(' ')}`));
      }
      const files = fs.readdirSync(absoluteTmpDir);
      const createdFile = files.find(f => f.startsWith(filename));
      if (!createdFile) return reject(new Error('Archivo no encontrado tras la descarga.'));
      resolve(path.join(absoluteTmpDir, createdFile));
    });

    child.on('error', reject);
  });

  const stats = fs.statSync(downloadedPath);
  if (stats.size < 1024) {
    fs.unlinkSync(downloadedPath);
    throw new Error('Archivo corrupto (tamaño muy pequeño).');
  }

  return { path: downloadedPath, title, size: stats.size, format: format === 'ogg' ? 'opus' : format };
}

// ── Función principal con fallback ────────────────────────────────────────────
export async function downloadYT(url, format = 'ogg') {
  try {
    return await downloadViaApi(url, format);
  } catch (apiErr) {
    log('WARN', `[YT] API falló: ${apiErr.message} — usando yt-dlp local...`);
    try {
      return await downloadViaYtdlp(url, format);
    } catch (ytErr) {
      log('ERROR', `Error en downloadYT: ${ytErr.message}`);
      throw ytErr;
    }
  }
}