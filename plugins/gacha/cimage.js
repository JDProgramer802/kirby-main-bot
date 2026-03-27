// @nombre: cimage
// @alias: cimage, customimage
// @categoria: gacha
// @descripcion: Cambia la imagen de tu personaje respondiendo a una foto. Usa la API de imgBB.

import { downloadMediaMessage } from '@itsukichann/baileys';
import { subirAImgBB } from '../../src/lib/imgbb.js';
import { query } from '../../src/lib/database.js';
import { formatearNumero } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

export default async function (m, { conn, text, sender, isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');
  if (!dbGroup.gacha_activo) return reply('❌ *Aww...* El gacha está desactivado aquí. 😿');

  if (!text) {
    return reply('⚠️ *¡Ay!* Dime a qué personaje le vas a cambiar la foto. `Ejemplo: /cimage Asuna` 🌸');
  }

  // Comprobar si hay una imagen adjunta
  let targetMessage = m;
  let isQuoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  
  if (isQuoted) {
    targetMessage = { message: isQuoted };
  }

  const type = Object.keys(targetMessage.message || {})[0];
  if (type !== 'imageMessage') {
    return reply('📸 *¡Uff!* Debes enviar o responder a una IMAGEN nueva para el personaje.');
  }

  try {
    // Comprobar si existe la columna imagen_personalizada y si no, crearla al vuelo
    await query(`ALTER TABLE harem ADD COLUMN IF NOT EXISTS imagen_personalizada TEXT;`);

    // Buscar al personaje en el harem
    const resChar = await query(
      `SELECT h.id as harem_id, p.nombre
       FROM harem h
       JOIN personajes_disponibles p ON h.personaje_id = p.id
       WHERE h.jid_usuario = $1 AND p.nombre ILIKE $2
       LIMIT 1`,
      [sender, `%${text.trim()}%`]
    );

    if (resChar.rows.length === 0) {
      return reply(`❌ *Aww...* No tienes a "${text}" en tu harem o escribiste mal el nombre. 😿`);
    }

    const el = resChar.rows[0];

    // Cobrar un precio premium por customizar (15,000)
    const costo = config.gacha.precioBuyChar * 3; // 15000 aprox
    const resEcon = await query(`SELECT monedas FROM economia WHERE jid = $1`, [sender]);
    
    if (Number(resEcon.rows[0].monedas) < costo) {
      return reply(`❌ *Uy...* Cambiar la apariencia mágica de tu waifu cuesta ${formatearNumero(costo)} ${config.economia.monedaEmoji}. Te falta dinero. 💸`);
    }

    reply('☁️ ✨ _Pintando nueva apariencia..._ (esto puede tardar unos segundos)');

    // Bajar la foto y subirla a ImgBB
    const buffer = await downloadMediaMessage(targetMessage, 'buffer', {});
    const urlImg = await subirAImgBB(buffer);

    if (!urlImg) {
      return reply('❌ *Error...* No pudimos hospedar la imagen en ImgBB. Intenta una foto más pequeñita o en un rato.');
    }

    // Actualizar tabla (cobrar y poner imagen)
    await query(`UPDATE economia SET monedas = monedas - $1 WHERE jid = $2`, [costo, sender]);
    await query(`UPDATE harem SET imagen_personalizada = $1 WHERE id = $2`, [urlImg, el.harem_id]);

    let txt = `╭ ꒰ 🎨 𝓡𝓮𝓷𝓸𝓿𝓪𝓬𝓲𝓸𝓷 𝓚𝓪𝔀𝓪𝓲𝓲 🎨 ꒱\n`;
    txt += `┊ ✨ ¡Ta-da!\n`;
    txt += `┊ 💖 Modificaste la foto de **${el.nombre}**.\n`;
    txt += `┊ 💰 Costo: -${formatearNumero(costo)} ${config.economia.monedaEmoji}\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    // Enviar mensaje con la foto nueva
    await conn.sendMessage(m.key.remoteJid, {
      image: { url: urlImg },
      caption: txt
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    reply('❌ *Oh no...* El hechizo de sastrería falló fatalmente.');
  }
}
