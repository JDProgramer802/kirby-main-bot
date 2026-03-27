// @nombre: wshop
// @alias: wshop, mercado, mercadowaifus
// @categoria: gacha
// @descripcion: Mercado de jugadores. Vende tus personajes a otros. Uso: /wshop [list | sell <nombre> <precio> | buy <ID>]

import { query } from '../../src/lib/database.js';
import { formatearNumero } from '../../src/lib/utils.js';
import config from '../../src/lib/config.js';

export default async function (m, { args, sender, isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');
  if (!dbGroup.gacha_activo) return reply('❌ *Aww...* El gacha está desactivado aquí. 😿');

  const accion = args[0]?.toLowerCase();

  // Asegurar columnas de mercado
  await query(`ALTER TABLE harem ADD COLUMN IF NOT EXISTS en_venta BOOLEAN DEFAULT false;`);
  await query(`ALTER TABLE harem ADD COLUMN IF NOT EXISTS precio_venta INT DEFAULT 0;`);

  if (!accion || accion === 'list') {
    const res = await query(
      `SELECT h.id, p.nombre, p.rareza, h.precio_venta, h.jid_usuario 
       FROM harem h JOIN personajes_disponibles p ON h.personaje_id = p.id
       WHERE h.en_venta = true
       ORDER BY h.precio_venta DESC LIMIT 15`
    );

    if (res.rows.length === 0) return reply('🛒 *Mercado Kawaii*\n\n_Aww, no hay nadie a la venta en este momento._ 😿');

    let txt = `╭ ꒰ 🛒 𝓜𝓮𝓻𝓬𝓪𝓭𝓸 𝓚𝓪𝔀𝓪𝓲𝓲 🛒 ꒱\n`;
    res.rows.forEach(r => {
      txt += `┊ [ID: ${r.id}] *${r.nombre}* [${'⭐'.repeat(r.rareza)}] - ${formatearNumero(r.precio_venta)} ✧\n┊ Vendedor: @${r.jid_usuario.split('@')[0]}\n`;
    });
    txt += `╰━━━━━━━━━━━━━━━━━ 💕\n_Para comprar: /wshop buy [ID]_`;
    return reply(txt);
  }

  if (accion === 'sell') {
    if (args.length < 3) return reply('⚠️ *¡Ay!* Faltan cositas.\n`Uso: /wshop sell [Nombre] [Precio]` 🌸');
    
    let precio = parseInt(args[args.length - 1]);
    if (isNaN(precio) || precio <= 0) return reply('❌ *Uh oh...* Precio inválido.');

    let nombre = args.slice(1, -1).join(' ');

    const res = await query(
      `SELECT h.id FROM harem h JOIN personajes_disponibles p ON h.personaje_id = p.id
       WHERE h.jid_usuario = $1 AND p.nombre ILIKE $2 LIMIT 1`,
      [sender, `%${nombre.trim()}%`]
    );

    if (res.rows.length === 0) return reply(`❌ *Uy...* No tienes a "${nombre}" en tu harem.`);

    await query(`UPDATE harem SET en_venta = true, precio_venta = $1 WHERE id = $2`, [precio, res.rows[0].id]);
    return reply(`✅ *¡Ta-da!* Pusiste a la venta a tu personaje por ${formatearNumero(precio)} ${config.economia.monedaEmoji}. 🛒`);
  }

  if (accion === 'buy') {
    let idCompra = parseInt(args[1]);
    if (isNaN(idCompra)) return reply('⚠️ *¡Ay!* Necesito el ID del personaje. `Ejemplo: /wshop buy 15`');

    const res = await query(
      `SELECT h.jid_usuario, h.precio_venta, p.nombre 
       FROM harem h JOIN personajes_disponibles p ON h.personaje_id = p.id 
       WHERE h.id = $1 AND h.en_venta = true`, [idCompra]
    );

    if (res.rows.length === 0) return reply('❌ *Uh oh...* Ese personaje no está a la venta o el ID es incorrecto. 😿');

    const char = res.rows[0];
    if (char.jid_usuario === sender) return reply('❌ *¡Bobo!* No puedes comprar tu propio personaje. 😂');

    const resEcon = await query(`SELECT monedas FROM economia WHERE jid = $1`, [sender]);
    if (Number(resEcon.rows[0].monedas) < char.precio_venta) {
      return reply(`❌ *Aww...* Te falta dinerito. Cuesta ${formatearNumero(char.precio_venta)} ${config.economia.monedaEmoji}. 💸`);
    }

    // Efectuar compra
    await query(`UPDATE economia SET monedas = monedas - $1 WHERE jid = $2`, [char.precio_venta, sender]);
    await query(`UPDATE economia SET monedas = monedas + $1 WHERE jid = $2`, [char.precio_venta, char.jid_usuario]);
    await query(`UPDATE harem SET jid_usuario = $1, en_venta = false, precio_venta = 0 WHERE id = $2`, [sender, idCompra]);

    let txt = `╭ ꒰ 🛍️ 𝓒𝓸𝓶𝓹𝓻𝓪 𝓔𝔁𝓲𝓽𝓸𝓼𝓪 🛍️ ꒱\n`;
    txt += `┊ ✨ ¡Felicidades!\n`;
    txt += `┊ 💖 Compraste a **${char.nombre}**.\n`;
    txt += `┊ 💰 Pagaste: -${formatearNumero(char.precio_venta)} ${config.economia.monedaEmoji}\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;
    return reply(txt);
  }

  reply('⚠️ *Uh oh...* Usa `/wshop list`, `/wshop sell <nombre> <precio>` o `/wshop buy <ID>`. 🌸');
}
