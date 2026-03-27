// @nombre: goodbye
// @alias: goodbye
// @categoria: admin
// @descripcion: Muestra el mensaje de despedida actual del grupo

export default async function (m, { isGroup, dbGroup, reply }) {
  if (!isGroup) return reply('❌ *Oopsie!* Este comando solo funciona en grupitos~ 🌸');

  const msg = dbGroup.msg_despedida;

  if (!msg) {
    return reply('⚠️ *Ah...* Este grupo no tiene un mensaje de despedida configurado. Usa /setgoodbye. 🥺');
  }

  let txt = `╭ ꒰ 🍂 𝓓𝓮𝓼𝓹𝓮𝓭𝓲𝓭𝓪 𝓐𝓬𝓽𝓾𝓪𝓵 🍂 ꒱\n`;
  msg.split('\n').forEach(linea => {
    txt += `┊ ${linea}\n`;
  });
  txt += `╰━━━━━━━━━━━━━━━━━ 💔`;

  reply(txt);
}
