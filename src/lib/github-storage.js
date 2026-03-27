import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sube un archivo a GitHub usando la API de GitHub
 * @param {Buffer} buffer - El buffer del archivo a subir
 * @param {string} fileName - El nombre del archivo con extensión
 * @param {string} folder - La carpeta donde guardar (banners, videos)
 * @returns {Promise<string|null>} - La URL del archivo en GitHub o null si falla
 */
export async function subirAGitHub(buffer, fileName, folder = 'banners') {
  try {
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO || 'JDProgramer802/kirby-main-bot';
    
    if (!token) {
      console.log('❌ GITHUB_TOKEN no configurado, usando fallback local');
      return await guardarArchivoLocal(buffer, fileName, folder);
    }

    // Crear directorio local si no existe
    const localDir = path.join(__dirname, '../../public', folder);
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    // Guardar archivo localmente primero
    const localPath = path.join(localDir, fileName);
    fs.writeFileSync(localPath, buffer);

    // Leer el archivo como base64
    const fileContent = fs.readFileSync(localPath, 'base64');
    
    const apiBase = 'https://api.github.com';
    const filePath = `${folder}/${fileName}`;
    
    // Verificar si el archivo ya existe
    const existingFileUrl = `${apiBase}/repos/${repo}/contents/${filePath}`;
    let sha = '';
    
    try {
      const existingResponse = await axios.get(existingFileUrl, {
        headers: {
          'Authorization': `token ${token}`,
          'User-Agent': 'Kirby-Bot'
        }
      });
      sha = existingResponse.data.sha;
    } catch (error) {
      // El archivo no existe, crearemos uno nuevo
    }

    // Subir o actualizar archivo
    const uploadUrl = `${apiBase}/repos/${repo}/contents/${filePath}`;
    const uploadData = {
      message: `Upload ${fileName} via Kirby Bot`,
      content: fileContent,
      sha: sha || undefined
    };

    const response = await axios.put(uploadUrl, uploadData, {
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Kirby-Bot'
      }
    });

    if (response.status === 200 || response.status === 201) {
      const githubUrl = `https://raw.githubusercontent.com/${repo}/main/${filePath}`;
      console.log(`✅ Archivo subido a GitHub: ${githubUrl}`);
      return githubUrl;
    }

    return null;
  } catch (error) {
    console.error('❌ Error subiendo a GitHub:', error.response?.data || error.message);
    // Fallback a almacenamiento local
    return await guardarArchivoLocal(buffer, fileName, folder);
  }
}

/**
 * Guarda un archivo localmente y genera una URL local
 * @param {Buffer} buffer - El buffer del archivo a guardar
 * @param {string} fileName - El nombre del archivo con extensión
 * @param {string} folder - La carpeta donde guardar
 * @returns {Promise<string|null>} - La URL local del archivo o null si falla
 */
async function guardarArchivoLocal(buffer, fileName, folder) {
  try {
    const uploadDir = path.join(__dirname, '../../public', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    
    // Generar URL (puedes configurar tu dominio aquí)
    const baseUrl = process.env.BASE_URL || 'https://your-domain.com';
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
 * Función principal que intenta subir a GitHub primero, si falla usa almacenamiento local
 * @param {Buffer} buffer - El buffer del archivo
 * @param {string} fileName - El nombre del archivo
 * @param {string} fileType - 'image' o 'video'
 * @returns {Promise<string|null>} - La URL del archivo o null si todo falla
 */
export async function subirArchivoConGitHub(buffer, fileName, fileType = 'image') {
  console.log(`🚀 Iniciando subida de ${fileType} con GitHub fallback...`);
  
  const folder = fileType === 'video' ? 'videos' : 'banners';
  
  // Intentar subir a GitHub primero
  const githubUrl = await subirAGitHub(buffer, fileName, folder);
  
  if (githubUrl) {
    console.log(`✅ Subida exitosa a GitHub: ${githubUrl}`);
    return githubUrl;
  }
  
  console.log('❌ Falló subida a GitHub, usando almacenamiento local');
  return null;
}
