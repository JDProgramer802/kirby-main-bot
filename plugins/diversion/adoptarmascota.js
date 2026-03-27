// @nombre: adoptarmascota
// @alias: adoptar, mascotanueva
// @categoria: diversion
// @descripcion: Adopta una mascota de Dream Land para cuidar y entrenar.
// @reaccion: 🥚

import axios from 'axios';
import { crearMascota, obtenerMascotas, query } from '../../src/lib/database.js';

export default async function(m, { conn, text, reply, sender }) {
  const mascotas = await obtenerMascotas(sender);
  if (mascotas.length >= 5) {
    return reply(`❌ *¡Ey parce!* Ya tienes el máximo de mascotas permitido (5). ¡Cuídalas bien! 🌸`);
  }

  const args = text.split('|').map(a => a.trim());
  const nombre = args[0];
  const urlForzada = args[1]; // URL opcional desde el buscador

  if (!nombre) {
    return reply('🐣 *¡Adopta una Mascota!* 🐣\n\nUsa `/adoptar Nombre` para comenzar tu aventura.\n\n*Ejemplo:* `/adoptar Popy`');
  }

  if (nombre.length > 15) return reply('❌ *¡Uy mijo!* Ese nombre está muy largo. Máximo 15 caracteres. 🌸');

  try {
    let tipoMascota, imgMascota, atqM, defM;

    if (urlForzada) {
      // Si viene desde /buscamascota
      tipoMascota = 'Especial 🌟';
      imgMascota = urlForzada;
      atqM = 15;
      defM = 15;
    } else {
      // Buscar en el pool de la base de datos
      const resPool = await query(`SELECT * FROM mascotas_pool ORDER BY RANDOM() LIMIT 1`);

      if (resPool.rows.length === 0) {
        return reply('❌ *¡Poyo!* El pool de mascotas está vacío. Dile al administrador que use `/fetchmascotas` para poblar Dream Land. 🌸');
      }

      const mPool = resPool.rows[0];
      tipoMascota = mPool.nombre_personaje;
      imgMascota = mPool.imagen_url;
      atqM = mPool.atq;
      defM = mPool.def;
    }

    const nuevaMascota = await crearMascota(sender, nombre, tipoMascota, imgMascota, atqM, defM);

    let txt = `╭ ꒰ 🐣 𝓝𝓾𝓮𝓿𝓪 𝓜𝓪𝓼𝓬𝓸𝓽𝓪 🐣 ꒱\n`;
    txt += `┊ ✨ ¡Felicidades parce!\n`;
    txt += `┊ 💖 Has adoptado a: **${nuevaMascota.nombre}**\n`;
    txt += `┊ 🌟 Tipo: **${nuevaMascota.tipo}**\n`;
    txt += `┊ ⚔️ Ataque Inicial: \`${atqM}\`\n`;
    txt += `┊ 🛡️ Defensa Inicial: \`${defM}\`\n`;
    txt += `┊ 🌸 ¡Usa \`/mascota\` para ver cómo está!\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    // Descargar imagen a buffer para evitar errores de Baileys
    let imageBuffer;
    try {
      const response = await axios.get(imgMascota, { responseType: 'arraybuffer' });
      imageBuffer = Buffer.from(response.data);
    } catch (e) {
      console.error('Error descargando imagen de mascota:', e.message);
    }

    if (imageBuffer) {
      await conn.sendMessage(m.key.remoteJid, {
        image: imageBuffer,
        caption: txt
      }, { quoted: m });
    } else {
      await reply(txt);
    }

  } catch (err) {
    console.error(err);
    reply('❌ *Oh no...* Hubo un problema al tramitar la adopción. Inténtalo más tarde.');
  }
}
