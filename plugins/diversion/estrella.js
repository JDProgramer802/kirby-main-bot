// @nombre: estrella
// @alias: star, volar
// @categoria: diversion
// @descripcion: Manda a alguien a volar en una estrella de Dream Land.
// @reaccion: ⭐

const MENSAJES = [
  '¡Poyo! @user se fue volando en una estrella directo a las nubes. ☁️✨',
  '¡Ave María! Miren como @user se aleja en su estrellita. ¡Chao pues! 👋⭐',
  '¡Qué chimba! @user ya está en el espacio exterior con Kirby. 🌌🌟',
  '¡Hágale mijo! @user acaba de despegar en una estrella súper sónica. 🚀💨',
  '¡Uy parce! @user se pegó un viaje en estrella y ya no se ve ni el rastro. 🌠👀'
];

export default async function(m, { conn, text, reply }) {
  let who;
  if (m.isGroup) {
    who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? (text.includes('@') ? text.replace(/[^0-9@.lid]/g, '') : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net') : null;
  } else {
    who = m.quoted ? m.quoted.sender : text ? (text.includes('@') ? text.replace(/[^0-9@.lid]/g, '') : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net') : m.chat;
  }

  if (!who) return reply('⚠️ *¡Ay mijo!* Tienes que mencionar a alguien o responder a su mensaje para mandarlo a volar. 🌸');

  const user = who.split('@')[0];
  const msg = MENSAJES[Math.floor(Math.random() * MENSAJES.length)];
  
  const finalMsg = `╭ ꒰ ⭐ 𝓥𝓲𝓪𝓳𝓮 𝓔𝓼𝓽𝓮𝓵𝓪𝓻 ⭐ ꒱\n` +
                   `┊ ✨ *Kirby activó la estrella!*\n` +
                   `┊ 🌟 *Pasajero:* @${user}\n` +
                   `┊ 💬 _"${msg.replace('@user', `@${user}`)}"_\n` +
                   `╰━━━━━━━━━━━━━━━━━ 💕`;

  await conn.sendMessage(m.chat, { 
    text: finalMsg, 
    mentions: [who] 
  }, { quoted: m });
}
