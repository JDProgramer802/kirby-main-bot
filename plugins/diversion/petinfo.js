// @nombre: petinfo
// @alias: mascotainfo, petstats
// @categoria: diversion
// @descripcion: Ver información detallada y biografía de tu mascota.
// @reaccion: 📖

import { obtenerMascotas } from '../../src/lib/database.js';
import axios from 'axios';

export default async function(m, { conn, args, reply, sender }) {
  const mascotas = await obtenerMascotas(sender);
  if (mascotas.length === 0) {
    return reply('❌ *¡Ay mijo!* No tienes mascota todavía. Usa `/adoptar Nombre` para conseguir una. 🌸');
  }

  const idMascota = args[0];
  let mascota = idMascota ? mascotas.find(p => p.id == idMascota) : mascotas[0];

  if (idMascota && !mascota) {
    return reply(`❌ *¡Oops!* No tienes ninguna mascota con el ID \`${idMascota}\`. 🌸`);
  }

  const fechaAdopcion = new Date(mascota.fecha_adopcion).toLocaleDateString('es-CO');
  
  let txt = `╭ ꒰ 📖 𝓘𝓷𝓯𝓸𝓻𝓶𝓪𝓬𝓲ó𝓷 𝓭𝓮 𝓜𝓪𝓼𝓬𝓸𝓽𝓪 📖 ꒱\n`;
  txt += `┊ ✨ *Nombre:* ${mascota.nombre}\n`;
  txt += `┊ 🌟 *Tipo:* ${mascota.tipo}\n`;
  txt += `┊ 📈 *Nivel Actual:* \`${mascota.nivel}\`\n`;
  txt += `┊ 🎖️ *Experiencia:* \`${mascota.experiencia}/${mascota.nivel * 100}\`\n`;
  txt += `┊ ⚔️ *Poder de Ataque:* \`${mascota.poder_ataque}\`\n`;
  txt += `┊ 🛡️ *Poder de Defensa:* \`${mascota.poder_defensa}\`\n`;
  txt += `┊ 📅 *Fecha de Adopción:* ${fechaAdopcion}\n`;
  txt += `┊ 🐾 *ID Único:* \`${mascota.id}\`\n`;
  txt += `╰━━━━━━━━━━━━━━━━━ 💕\n\n`;
  txt += `💬 _"Este ${mascota.tipo} es fiel a su dueño y entrena duro cada día en Dream Land para ser el más teso de Medellín."_`;

  if (mascota.imagen_url) {
    try {
      const response = await axios.get(mascota.imagen_url, { responseType: 'arraybuffer' });
      return conn.sendMessage(m.key.remoteJid, {
        image: Buffer.from(response.data),
        caption: txt
      }, { quoted: m });
    } catch {
      return reply(txt);
    }
  }
  
  return reply(txt);
}
