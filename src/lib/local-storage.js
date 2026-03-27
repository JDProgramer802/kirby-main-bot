import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Guarda un archivo localmente y genera una URL local para acceder
 * @param {Buffer} buffer - El buffer del archivo a guardar
 * @param {string} fileName - El nombre del archivo con extensión
 * @param {string} folder - La carpeta donde guardar (banners, temp, etc)
 * @returns {Promise<string|null>} - La URL local del archivo o null si falla
 */
export async function guardarArchivoLocal(buffer, fileName, folder = 'banners') {
  try {
    // Crear directorio si no existe
    const uploadDir = path.join(__dirname, '../../public', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Ruta completa del archivo
    const filePath = path.join(uploadDir, fileName);
    
    // Guardar archivo
    fs.writeFileSync(filePath, buffer);
    
    // Generar URL (ajusta según tu configuración)
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const fileUrl = `${baseUrl}/${folder}/${fileName}`;
    
    console.log(`✅ Archivo guardado localmente: ${filePath}`);
    console.log(`🔗 URL generada: ${fileUrl}`);
    
    return fileUrl;
  } catch (error) {
    console.error('❌ Error guardando archivo localmente:', error.message);
    return null;
  }
}

/**
 * Elimina archivos antiguos para no saturar el almacenamiento
 * @param {string} folder - La carpeta a limpiar
 * @param {number} maxAge - Edad máxima en horas (por defecto 24h)
 */
export function limpiarArchivosAntiguos(folder = 'banners', maxAge = 24) {
  try {
    const uploadDir = path.join(__dirname, '../../public', folder);
    if (!fs.existsSync(uploadDir)) return;

    const files = fs.readdirSync(uploadDir);
    const now = Date.now();
    const maxAgeMs = maxAge * 60 * 60 * 1000;

    files.forEach(file => {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAgeMs) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Archivo antiguo eliminado: ${file}`);
      }
    });
  } catch (error) {
    console.error('❌ Error limpiando archivos antiguos:', error.message);
  }
}

/**
 * Función principal que intenta subir a servicios externos, 
 * si falla guarda localmente
 * @param {Buffer} buffer - El buffer del archivo
 * @param {string} fileName - El nombre del archivo
 * @param {string} fileType - 'image' o 'video'
 * @returns {Promise<string|null>} - La URL del archivo o null si todo falla
 */
export async function subirArchivoConFallback(buffer, fileName, fileType = 'image') {
  console.log(`🚀 Iniciando subida de ${fileType} con fallback local...`);
  
  // Primero intentar servicios externos
  try {
    const { subirArchivoMultiServicio } = await import('./upload-apis.js');
    const urlExterna = await subirArchivoMultiServicio(buffer, fileName, fileType);
    
    if (urlExterna) {
      console.log(`✅ Subida exitosa a servicio externo: ${urlExterna}`);
      return urlExterna;
    }
  } catch (error) {
    console.log('❌ Todos los servicios externos fallaron, usando almacenamiento local');
  }
  
  // Si todo falla, guardar localmente
  const folder = fileType === 'video' ? 'videos' : 'banners';
  const urlLocal = await guardarArchivoLocal(buffer, fileName, folder);
  
  if (urlLocal) {
    console.log(`✅ Archivo guardado localmente: ${urlLocal}`);
    // Limpiar archivos antiguos cada vez que se guarda uno nuevo
    limpiarArchivosAntiguos(folder, 48); // Mantener por 48 horas
    return urlLocal;
  }
  
  console.error('🚫 No se pudo guardar el archivo en ningún lugar');
  return null;
}
