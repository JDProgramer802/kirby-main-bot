import axios from 'axios';
import FormData from 'form-data';

/**
 * Sube un archivo (imagen o video) a Catbox.moe
 * @param {Buffer} buffer El buffer del archivo a subir.
 * @param {string} fileName El nombre del archivo con su extensión (ej: video.mp4).
 * @returns {Promise<string|null>} La URL del archivo subido o null si falla.
 */
export async function subirACatbox(buffer, fileName) {
  const maxRetries = 3;
  const timeoutMs = 60000; // 60 seconds timeout para dar más tiempo

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Intento ${attempt}/${maxRetries} - Subiendo archivo a Catbox...`);
      
      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', buffer, { 
        filename: fileName,
        contentType: fileName.endsWith('.mp4') ? 'video/mp4' : 'image/png'
      });

      const { data } = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: {
          ...form.getHeaders(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive',
        },
        timeout: timeoutMs,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      console.log('Respuesta de Catbox:', data);

      if (!data) {
        throw new Error('Respuesta vacía de Catbox');
      }

      if (typeof data !== 'string') {
        throw new Error('Respuesta inválida de Catbox');
      }

      if (!data.startsWith('https://')) {
        throw new Error(`Catbox error: ${data}`);
      }

      console.log(`✅ Archivo subido exitosamente: ${data}`);
      return data;

    } catch (e) {
      const errorMsg = e.response?.data || e.message || 'Error desconocido';
      console.error(`❌ Intento ${attempt}/${maxRetries} - Error al subir a Catbox:`, errorMsg);
      
      if (attempt === maxRetries) {
        console.error('🚫 Error al subir a Catbox después de', maxRetries, 'intentos');
        return null;
      }
      
      // Esperar antes del siguiente intento (backoff exponencial)
      const waitTime = attempt * 3000;
      console.log(`⏳ Esperando ${waitTime}ms antes del siguiente intento...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}
