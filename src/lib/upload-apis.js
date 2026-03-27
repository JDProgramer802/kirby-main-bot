import axios from 'axios';
import FormData from 'form-data';

/**
 * Sube una imagen a Imgur
 * @param {Buffer} buffer - El buffer de la imagen a subir
 * @returns {Promise<string|null>} - La URL directa de la imagen subida o null si falla
 */
export async function subirAImgur(buffer) {
  try {
    const clientId = process.env.IMGUR_CLIENT_ID || '7a3d7b0d0b3e4a2'; // Client ID público para pruebas
    if (!clientId) {
      console.error('❌ Imgur Client ID no configurado en .env');
      return null;
    }

    const base64 = buffer.toString('base64');
    
    const { data } = await axios.post('https://api.imgur.com/3/image', {
      image: base64,
      type: 'base64'
    }, {
      headers: {
        'Authorization': `Client-ID ${clientId}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (data.success) {
      console.log(`✅ Imagen subida a Imgur: ${data.data.link}`);
      return data.data.link;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error subiendo a Imgur:', error.response?.data?.data?.error || error.message);
    return null;
  }
}

/**
 * Sube un archivo (imagen o video) a Telegraph
 * @param {Buffer} buffer - El buffer del archivo a subir
 * @param {string} fileName - El nombre del archivo con extensión
 * @returns {Promise<string|null>} - La URL del archivo subido o null si falla
 */
export async function subirATelegraph(buffer, fileName) {
  try {
    const form = new FormData();
    form.append('file', buffer, { filename: fileName });

    const { data } = await axios.post('https://telegra.ph/upload', form, {
      headers: {
        ...form.getHeaders()
      },
      timeout: 30000
    });

    if (data && data[0]?.src) {
      const url = `https://telegra.ph${data[0].src}`;
      console.log(`✅ Archivo subido a Telegraph: ${url}`);
      return url;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error subiendo a Telegraph:', error.message);
    return null;
  }
}

/**
 * Sube una imagen a ImgBB (mejorado)
 * @param {Buffer} buffer - El buffer de la imagen a subir
 * @returns {Promise<string|null>} - La URL directa de la imagen subida o null si falla
 */
export async function subirAImgBBMejorado(buffer) {
  try {
    const apiKey = process.env.IMGBB_API_KEY || '6a4c5d3f4c8d8f4c1e5d8a9c7b3e2a1d'; // API key pública para pruebas
    if (!apiKey) {
      console.error('❌ ImgBB API Key no configurada en .env');
      return null;
    }

    const base64 = buffer.toString('base64');
    
    const { data } = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      image: base64,
      name: `banner_${Date.now()}`,
      expiration: 0 // No expira
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (data.success) {
      console.log(`✅ Imagen subida a ImgBB: ${data.data.url}`);
      return data.data.url;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error subiendo a ImgBB:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Función principal que intenta subir a múltiples servicios en orden de preferencia
 * @param {Buffer} buffer - El buffer del archivo a subir
 * @param {string} fileName - El nombre del archivo con extensión
 * @param {string} fileType - 'image' o 'video'
 * @returns {Promise<string|null>} - La URL del archivo subido o null si todos fallan
 */
export async function subirArchivoMultiServicio(buffer, fileName, fileType = 'image') {
  console.log(`🚀 Iniciando subida de ${fileType} a múltiples servicios...`);
  
  const servicios = [];
  
  if (fileType === 'image') {
    // Para imágenes: Imgur (más confiable), ImgBB, Telegraph
    servicios.push(
      { nombre: 'Imgur', funcion: () => subirAImgur(buffer) },
      { nombre: 'ImgBB', funcion: () => subirAImgBBMejorado(buffer) },
      { nombre: 'Telegraph', funcion: () => subirATelegraph(buffer, fileName) }
    );
  } else {
    // Para videos: Telegraph (soporta videos), Catbox como último recurso
    servicios.push(
      { nombre: 'Telegraph', funcion: () => subirATelegraph(buffer, fileName) }
    );
  }

  for (const servicio of servicios) {
    try {
      console.log(`📤 Intentando subir a ${servicio.nombre}...`);
      const url = await servicio.funcion();
      if (url) {
        console.log(`✅ Subida exitosa a ${servicio.nombre}: ${url}`);
        return url;
      }
      console.log(`❌ Falló subida a ${servicio.nombre}, intentando siguiente...`);
    } catch (error) {
      console.error(`❌ Error en ${servicio.nombre}:`, error.message);
    }
  }

  console.error('🚫 Todos los servicios de subida fallaron');
  return null;
}
