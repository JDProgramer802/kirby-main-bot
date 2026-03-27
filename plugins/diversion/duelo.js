// @nombre: duelo
// @alias: pvp, pelea, combate
// @categoria: diversion
// @descripcion: Retar a alguien a un duelo de mascotas.
// @reaccion: ⚔️

import { actualizarMascota, obtenerMascota } from '../../src/lib/database.js';

const COMBATES = new Map();

export default async function(m, { conn, text, reply, sender }) {
  const mascotaSender = await obtenerMascota(sender);
  if (!mascotaSender) {
    return reply('❌ *¡Ay mijo!* No tienes mascota todavía. Usa `/adoptar Nombre` para conseguir una. 🌸');
  }

  if (mascotaSender.salud < 20) return reply('❌ *¡Poyo!* Tu mascota está muy herida o cansada para pelear. Cúrala primero. 🌸');

  let who;
  if (m.isGroup) {
    who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? (text.includes('@') ? text.replace(/[^0-9@.lid]/g, '') : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net') : null;
  } else {
    who = m.quoted ? m.quoted.sender : text ? (text.includes('@') ? text.replace(/[^0-9@.lid]/g, '') : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net') : null;
  }

  if (!who) return reply('⚠️ *¡Ay mijo!* Tienes que mencionar a alguien o responder a su mensaje para retarlo a un duelo de mascotas. 🌸');
  if (who === sender) return reply('❌ *¡Poyo!* No puedes pelear contra tu propia mascota. 🌸');

  const mascotaOponente = await obtenerMascota(who);
  if (!mascotaOponente) {
    return reply('❌ *¡Oops!* Esa persona no tiene una mascota registrada aún. 🌸');
  }

  if (mascotaOponente.salud < 20) return reply('❌ *¡Uy!* La mascota del oponente no está en condiciones de pelear. 🌸');

  // Lógica de Combate
  await reply(`⚔️ *¡Reto de Duelo!* ⚔️\n\n**${mascotaSender.nombre}** (Lv.${mascotaSender.nivel}) VS **${mascotaOponente.nombre}** (Lv.${mascotaOponente.nivel})\n\n¡Preparando el combate mijo! 🌸✨`);

  setTimeout(async () => {
    // Cálculo simple de ganador
    const atqS = mascotaSender.poder_ataque + (Math.random() * 20);
    const defS = mascotaSender.poder_defensa + (Math.random() * 10);
    const atqO = mascotaOponente.poder_ataque + (Math.random() * 20);
    const defO = mascotaOponente.poder_defensa + (Math.random() * 10);

    const scoreS = atqS - defO;
    const scoreO = atqO - defS;

    let ganador, perdedor, jidGanador, jidPerdedor;
    if (scoreS > scoreO) {
      ganador = mascotaSender;
      perdedor = mascotaOponente;
      jidGanador = sender;
      jidPerdedor = who;
    } else {
      ganador = mascotaOponente;
      perdedor = mascotaSender;
      jidGanador = who;
      jidPerdedor = sender;
    }

    // Actualizar estadísticas
    const xpGanada = 50 + (ganador.nivel * 5);
    const danoRecibido = Math.floor(Math.random() * 20) + 10;

    await actualizarMascota(jidGanador, {
      experiencia: ganador.experiencia + xpGanada,
      salud: Math.max(0, ganador.salud - 5)
    });

    await actualizarMascota(jidPerdedor, {
      salud: Math.max(0, perdedor.salud - danoRecibido)
    });

    let txt = `╭ ꒰ ⚔️ 𝓡𝓮𝓼𝓾𝓵𝓽𝓪𝓭𝓸 𝓭𝓮𝓵 𝓓𝓾𝓮𝓵𝓸 ⚔️ ꒱\n`;
    txt += `┊ 🏆 ¡El ganador es **${ganador.nombre}**!\n`;
    txt += `┊ 🌟 Recompensa: \`+${xpGanada} XP\`\n`;
    txt += `┊ 💥 **${perdedor.nombre}** perdió \`${danoRecibido}\` de salud.\n`;
    txt += `┊ 🌸 ¡Qué chimba de pelea mijo! ✨\n`;
    txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

    if (ganador.imagen_url) {
      await conn.sendMessage(m.chat, {
        image: { url: ganador.imagen_url },
        caption: txt,
        mentions: [jidGanador, jidPerdedor]
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, {
        text: txt,
        mentions: [jidGanador, jidPerdedor]
      }, { quoted: m });
    }

  }, 3000);
}
