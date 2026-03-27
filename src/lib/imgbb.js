import axios from 'axios';
import FormData from 'form-data';
import config from './config.js';

/**
 * Sube un buffer de imagen a ImgBB
 * @param {Buffer} buffer - El buffer de la imagen a subir
 * @returns {Promise<string|null>} - La URL directa de la imagen subida o null si falla
 */
export async function subirAImgBB(buffer) {
  try {
    const apiKey = config.imgbbApiKey || process.env.IMGBB_API_KEY;
    if (!apiKey) {
      console.error('❌ ImgBB API Key no configurada en .env ni en config.js');
      return null;
    }

    const form = new FormData();
    // ImgBB espera base64 para imágenes enviadas por post directo sin multipart estructurado estricto, 
    // pero funciona bien enviando el base64 como string o un stream.
    // Lo más seguro es mandar la imagen codificada en base64:
    form.append('image', buffer.toString('base64'));

    const res = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, form, {
      headers: {
        ...form.getHeaders()
      }
    });

    if (res.data && res.data.success) {
      return res.data.data.url; // Retorna la URL de la imagen directa
    }
    
    return null;
  } catch (err) {
    console.error('Error subiendo a ImgBB:', err.response?.data || err.message);
    return null;
  }
}
