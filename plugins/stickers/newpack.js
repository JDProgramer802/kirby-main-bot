// @nombre: newpack
// @alias: newpack, crearparete
// @categoria: stickers
// @descripcion: Crea un nuevo paquete de stickers vacío. (Uso: /newpack [Nombre])

import { query } from '../../src/lib/database.js';

export default async function (m, { text, sender, isGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  if (!text) {
    return reply('⚠️ *¡Ay!* Dime cómo se llamará tu paquete. `Ejemplo: /newpack Kirby Cute` 🌸');
  }

  const nombrePack = text.trim();

  try {
    // Comprobar si el usuario ya tiene demasiados paquetes (límite 5 para no saturar)
    const resCount = await query(`SELECT COUNT(id) as total FROM packs_stickers WHERE jid_creador = $1`, [sender]);
    if (parseInt(resCount.rows[0].total) >= 5) {
      return reply('❌ *¡Guau!* Ya tienes 5 paquetes creados. Borra uno antes de crear otro. 📦');
    }

    // Comprobar si existe uno con ese nombre exacto del mismo creador
    const resExist = await query(`SELECT id FROM packs_stickers WHERE jid_creador = $1 AND nombre ILIKE $2`, [sender, nombrePack]);
    if (resExist.rows.length > 0) {
      return reply(`⚠️ *¡Ey!* Ya tienes un paquete que se llama "${nombrePack}". Inventa otro nombre. 💕`);
    }

    // Crear el paquete
    await query(`INSERT INTO packs_stickers (nombre, jid_creador) VALUES ($1, $2)`, [nombrePack, sender]);

    let txt = `╭ ꒰ 📦 𝓝𝓾𝓮𝓿𝓸 𝓟𝓪𝓺𝓾𝓮𝓽𝓮 📦 ꒱\n`;
    txt += `┊ ✨ ¡Felicidades, creador!\n`;
    txt += `┊ 💖 El paquete **${nombrePack}** está listo.\n`;
    txt += `┊ 🎀 _Usa /stickeradd para llenarlo de magia._\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    reply(txt);
  } catch (err) {
    console.error(err);
    reply('❌ *Aww...* Se cayó la caja fuerte de los paquetes.');
  }
}
