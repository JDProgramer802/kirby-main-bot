// @nombre: cvideo
// @alias: cvideo, customvideo
// @categoria: gacha
// @descripcion: Permite establecer un video o GIF para tu waifu/husbando enviando una URL directa de .mp4/.gif.

import { query } from '../../src/lib/database.js';
import { formatearNumero } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

export default async function (m, { conn, args, sender, isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');
  if (!dbGroup.gacha_activo) return reply('❌ *Aww...* El gacha está desactivado aquí. 😿');

  if (args.length < 2) {
    return reply('⚠️ *¡Ay!* Dime a qué personaje y pasame la URL del video.\n`Ejemplo: /cvideo Asuna https://ejemplo.com/gif.mp4` 🌸');
  }

  const urlVideo = args[args.length - 1]; // El último argumento debe ser la URL
  const nombre = args.slice(0, -1).join(' ');

  if (!urlVideo.startsWith('http')) {
    return reply('❌ *Uh oh...* La URL no parece un enlace válido. 🥺');
  }

  try {
    await query(`ALTER TABLE harem ADD COLUMN IF NOT EXISTS video_personalizado TEXT;`);

    // Buscar al personaje en el harem
    const resChar = await query(
      `SELECT h.id as harem_id, p.nombre
       FROM harem h
       JOIN personajes_disponibles p ON h.personaje_id = p.id
       WHERE h.jid_usuario = $1 AND p.nombre ILIKE $2
       LIMIT 1`,
      [sender, `%${nombre.trim()}%`]
    );

    if (resChar.rows.length === 0) {
      return reply(`❌ *Aww...* No tienes a "${nombre}" en tu harem. 😿`);
    }

    const el = resChar.rows[0];

    // Cobrar (20,000)
    const costo = config.gacha.precioBuyChar * 4; 
    const resEcon = await query(`SELECT monedas FROM economia WHERE jid = $1`, [sender]);
    
    if (Number(resEcon.rows[0].monedas) < costo) {
      return reply(`❌ *Uy...* Poner un video animado cuesta ${formatearNumero(costo)} ${config.economia.monedaEmoji}. Eres muy pobre. 💸`);
    }

    await query(`UPDATE economia SET monedas = monedas - $1 WHERE jid = $2`, [costo, sender]);
    await query(`UPDATE harem SET video_personalizado = $1 WHERE id = $2`, [urlVideo, el.harem_id]);

    let txt = `╭ ꒰ 🎥 𝓥𝓲𝓭𝓮𝓸 𝓚𝓪𝔀𝓪𝓲𝓲 🎥 ꒱\n`;
    txt += `┊ ✨ ¡Ta-da!\n`;
    txt += `┊ 💖 Animaste a **${el.nombre}** con el enlace proporcionado.\n`;
    txt += `┊ 💰 Costo: -${formatearNumero(costo)} ${config.economia.monedaEmoji}\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    // Enviar mensaje (si Baileys soporta video remoto fácil)
    await conn.sendMessage(m.key.remoteJid, {
      video: { url: urlVideo },
      gifPlayback: true,
      caption: txt
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    reply('❌ *Oh no...* La cinta de video se quemó. Asegúrate de que tu link sea mp4/gif directo.');
  }
}
