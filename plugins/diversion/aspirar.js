// @nombre: aspirar
// @alias: swallow, comer
// @categoria: diversion
// @descripcion: Aspira a alguien y obtén un poder aleatorio al estilo Kirby.
// @reaccion: 🌬️

const PODERES = [
  { nombre: 'Dormilón 💤', msg: '¡Poyo! Ahora tengo el poder de dormir 24/7 como @user. ¡Qué sueño pues mijo!' },
  { nombre: 'Cocinero 🍳', msg: '¡Ave María! Ahora sé cocinar una bandeja paisa mejor que @user. ¡A comer pues!' },
  { nombre: 'Espadachín ⚔️', msg: '¡Hágale pues! Ahora tengo la espada de @user y nadie me gana en Dream Land.' },
  { nombre: 'Cantante 🎤', msg: '¡Poyo poyo! Ahora canto tan feo como @user... ¡Tapense los oídos parce!' },
  { nombre: 'Vago 🛋️', msg: '¡Uy mijo! Ahora tengo el poder de no hacer ni pío, igualito a @user.' },
  { nombre: 'Elegante ✨', msg: '¡Qué elegancia la de Francia! Ahora soy tan pinchado como @user.' },
  { nombre: 'Fuego 🔥', msg: '¡Cuidado pues! Que ahora escupo fuego como @user cuando come mucho ají.' },
  { nombre: 'Hielo ❄️', msg: '¡Qué frío mijo! Ahora soy un cubito de hielo igual de frío que el corazón de @user.' }
];

export default async function(m, { conn, text, reply }) {
  let who;
  if (m.isGroup) {
    who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? (text.includes('@') ? text.replace(/[^0-9@.lid]/g, '') : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net') : null;
  } else {
    who = m.quoted ? m.quoted.sender : text ? (text.includes('@') ? text.replace(/[^0-9@.lid]/g, '') : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net') : m.chat;
  }

  if (!who) return reply('⚠️ *¡Ay mijo!* Tienes que mencionar a alguien o responder a su mensaje para aspirarlo. 🌸');

  const user = who.split('@')[0];
  const poder = PODERES[Math.floor(Math.random() * PODERES.length)];

  const finalMsg = `╭ ꒰ 🌬️ 𝓚𝓲𝓻𝓫𝔂 𝓐𝓼𝓹𝓲𝓻𝓪𝓭𝓸𝓻 🌬️ ꒱\n` +
                   `┊ ✨ *Kirby aspiró a:* @${user}\n` +
                   `┊ 🌟 *Poder obtenido:* **${poder.nombre}**\n` +
                   `┊ 💬 _"${poder.msg.replace('@user', `@${user}`)}"_\n` +
                   `╰━━━━━━━━━━━━━━━━━ 💕`;

  await conn.sendMessage(m.chat, {
    text: finalMsg,
    mentions: [who]
  }, { quoted: m });
}
