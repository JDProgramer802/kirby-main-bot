// @nombre: mascota
// @alias: mimascota, pets, info_mascota
// @categoria: diversion
// @descripcion: Ver estado de tu mascota, alimentarla o jugar con ella.
// @reaccion: 🐾

import axios from 'axios';
import { actualizarMascota, obtenerMascotas } from '../../src/lib/database.js';

const ALIMENTOS = [
  { nombre: 'Maxi-Tomate 🍅', hambre: 30, salud: 10 },
  { nombre: 'Manzana 🍎', hambre: 15, salud: 5 },
  { nombre: 'Pastel 🍰', hambre: 40, salud: -5 },
  { nombre: 'Piruleta 🍭', hambre: 10, salud: 2 }
];

export default async function(m, { conn, args, reply, sender }) {
  const mascotas = await obtenerMascotas(sender);
  if (mascotas.length === 0) {
    return reply('❌ *¡Ay mijo!* No tienes mascota todavía. Usa `/adoptar Nombre` para conseguir una. 🌸');
  }

  // Si hay más de una mascota y no se especificó ID, mostrar lista
  const idMascota = args.find(a => !isNaN(a));
  let mascota = idMascota ? mascotas.find(p => p.id == idMascota) : mascotas[0];

  if (idMascota && !mascota) {
    return reply(`❌ *¡Oops!* No tienes ninguna mascota con el ID \`${idMascota}\`. Usa \`/mascota\` para ver tu lista. 🌸`);
  }

  const accion = args[0]?.toLowerCase();

  // 1. Mostrar Lista o Estado
  if (!accion || (!isNaN(accion) && !args[1])) {
    if (mascotas.length > 1 && !idMascota) {
      let listTxt = `╭ ꒰ 🐾 𝓣𝓾𝓼 𝓜𝓪𝓼𝓬𝓸𝓽𝓪𝓼 🐾 ꒱\n`;
      mascotas.forEach(p => {
        listTxt += `┊ 🌟 [\`${p.id}\`] **${p.nombre}** (${p.tipo}) - Lv.${p.nivel}\n`;
      });
      listTxt += `╰━━━━━━━━━━━━━━━━━ 💕\n\n`;
      listTxt += `💡 _Usa \`/mascota [ID]\` para ver a una en específico._`;
      return reply(listTxt);
    }

    let txt = `╭ ꒰ 🐾 𝓔𝓼𝓽𝓪𝓭𝓸 𝓭𝓮 𝓜𝓪𝓼𝓬𝓸𝓽𝓪 🐾 ꒱\n`;
    txt += `┊ ✨ ID: \`${mascota.id}\`\n`;
    txt += `┊ 🌟 Nombre: **${mascota.nombre}**\n`;
    txt += `┊ 📈 Tipo: **${mascota.tipo}**\n`;
    txt += `┊ 📈 Nivel: \`${mascota.nivel}\` (XP: \`${mascota.experiencia}\`)\n`;
    txt += `┊ 🥩 Hambre: \`${mascota.hambre}/100\`\n`;
    txt += `┊ 💖 Salud: \`${mascota.salud}/100\`\n`;
    txt += `┊ 🛡️ Ataque/Defensa: \`${mascota.poder_ataque}/${mascota.poder_defensa}\`\n`;
    txt += `┊ 🌸 *Acciones:* \`/mascota comer [ID]\` | \`/mascota jugar [ID]\`\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    if (mascota.imagen_url) {
      try {
        const response = await axios.get(mascota.imagen_url, { responseType: 'arraybuffer' });
        return conn.sendMessage(m.key.remoteJid, {
          image: Buffer.from(response.data),
          caption: txt
        }, { quoted: m });
      } catch (e) {
        console.error('Error enviando imagen de mascota:', e.message);
        return reply(txt);
      }
    }
    return reply(txt);
  }

  // 2. Alimentar
  if (accion === 'comer' || accion === 'alimentar') {
    if (mascota.hambre >= 100) return reply(`❌ *¡Poyo!* **${mascota.nombre}** ya está llena, no quiere comer más pues mijo. 🌸`);

    const comida = ALIMENTOS[Math.floor(Math.random() * ALIMENTOS.length)];
    const nuevaHambre = Math.min(100, mascota.hambre + comida.hambre);
    const nuevaSalud = Math.min(100, mascota.salud + comida.salud);

    await actualizarMascota(sender, {
      hambre: nuevaHambre,
      salud: nuevaSalud,
      ultima_comida: new Date()
    }, mascota.id);

    return reply(`🍱 *Alimentando...* le diste a **${mascota.nombre}** una **${comida.nombre}**.\n\n🥩 Hambre: \`+${comida.hambre}\`\n💖 Salud: \`${comida.salud >= 0 ? '+' : ''}${comida.salud}\`\n\n¡Qué rico poyo! (っ˘ڡ˘ς)`);
  }

  // 3. Jugar
  if (accion === 'jugar' || accion === 'diversion') {
    if (mascota.hambre < 20) return reply(`❌ *¡Poyo!* **${mascota.nombre}** tiene mucha hambre para jugar. Aliméntala primero pues. 🌸`);

    const xpGanada = Math.floor(Math.random() * 20) + 10;
    const nuevaExperiencia = mascota.experiencia + xpGanada;
    const nuevaHambre = Math.max(0, mascota.hambre - 15);

    let subioNivel = false;
    let nuevoNivel = mascota.nivel;
    if (nuevaExperiencia >= mascota.nivel * 100) {
      nuevoNivel++;
      subioNivel = true;
    }

    await actualizarMascota(sender, {
      experiencia: subioNivel ? 0 : nuevaExperiencia,
      nivel: nuevoNivel,
      hambre: nuevaHambre,
      poder_ataque: subioNivel ? mascota.poder_ataque + 5 : mascota.poder_ataque,
      poder_defensa: subioNivel ? mascota.poder_defensa + 3 : mascota.poder_defensa,
      ultimo_juego: new Date()
    }, mascota.id);

    let txt = `🎮 *Jugando...* Te divertiste mucho con **${mascota.nombre}**.\n\n🌟 XP: \`+${xpGanada}\`\n🥩 Hambre: \`-15\`\n`;
    if (subioNivel) txt += `\n🎉 *¡SUBIÓ DE NIVEL!* Ahora es Nivel \`${nuevoNivel}\` y es más fuerte. ✨`;

    return reply(txt);
  }

  return reply('❌ *Opción inválida.* Usa `/mascota comer [ID]` o `/mascota jugar [ID]`.');
}
