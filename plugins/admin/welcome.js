// @nombre: welcome
// @alias: welcome
// @categoria: admin
// @descripcion: Muestra el mensaje de bienvenida actual del grupo

export default async function (m, { isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  const msg = dbGroup.msg_bienvenida;

  if (!msg) {
    return reply('⚠️ *Ah...* Este grupo no tiene un mensaje de bienvenida configurado. Usa /setwelcome. 🥺');
  }

  let txt = `╭ ꒰ 🌸 𝓑𝓲𝓮𝓷𝓿𝓮𝓷𝓲𝓭𝓪 𝓐𝓬𝓽𝓾𝓪𝓵 🌸 ꒱\n`;
  msg.split('\n').forEach(linea => {
    txt += `┊ ${linea}\n`;
  });
  txt += `╰━━━━━━━━━━━━━━━━━ 💕`;

  reply(txt);
}
