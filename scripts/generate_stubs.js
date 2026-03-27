import fs from 'fs';
import path from 'path';

const PLUGINS_DIR = 'C:\\laragon\\www\\kirby-pro\\plugins';

const complexCommands = {
  economia: [
    { n: 'balance', a: 'bal, coins', d: 'Ver cuantos coins tienes.', r: '💰' },
    { n: 'coinflip', a: 'flip, cf', d: 'Apostar coins en un cara o cruz.', r: '🪙' },
    { n: 'crime', a: '', d: 'Ganar coins rapido.', r: '🕵️' },
    { n: 'daily', a: '', d: 'Reclamar tu recompensa diaria.', r: '📆' },
    { n: 'deposit', a: 'dep, depositar, d', d: 'Depositar tus coins en el banco.', r: '🏦' },
    { n: 'economyboard', a: 'eboard, baltop', d: 'Ver el ranking de usuarios con más coins.', r: '🏆' },
    { n: 'economyinfo', a: 'einfo', d: 'Ver tu información de economía en el grupo.', r: '📊' },
    { n: 'givecoins', a: 'pay, coinsgive', d: 'Dar coins a un usuario.', r: '💸' },
    { n: 'roulette', a: 'rt', d: 'Apostar coins en una ruleta.', r: '🎰' },
    { n: 'slut', a: '', d: 'Ganar coins prostituyéndote.', r: '💋' },
    { n: 'steal', a: 'robar, rob', d: 'Intentar robar coins a un usuario.', r: '🥷' },
    { n: 'withdraw', a: 'with, retirar', d: 'Retirar tus coins en el banco.', r: '🏧' },
    { n: 'work', a: 'w', d: 'Ganar coins trabajando.', r: '⚒️' }
  ],
  stickers: [
    { n: 'delpack', a: '', d: 'Elimina un paquete de stickers.', r: '🗑️' },
    { n: 'delstickermeta', a: 'delmeta', d: 'Restablecer el pack y autor.', r: '🔄' },
    { n: 'getpack', a: 'stickerpack, pack', d: 'Descarga un paquete de stickers.', r: '📦' },
    { n: 'newpack', a: 'newstickerpack', d: 'Crea un nuevo paquete de stickers.', r: '🆕' },
    { n: 'packfavourite', a: 'setpackfav, packfav', d: 'Establece un paquete como favorito.', r: '⭐' },
    { n: 'packunfavourite', a: 'unsetpackfav, packunfav', d: 'Elimina un paquete de favoritos.', r: '❌' },
    { n: 'setpackprivate', a: 'setpackpriv, packprivate', d: 'Establecer paquete como privado.', r: '🔒' },
    { n: 'setpackpublic', a: 'setpackpub, packpublic', d: 'Establecer paquete como público.', r: '🔓' },
    { n: 'setstickermeta', a: 'setmeta', d: 'Establecer metadata de stickers.', r: '✍️' },
    { n: 'setstickerpackdesc', a: 'setpackdesc, packdesc', d: 'Establece desc. de paquete.', r: '📝' },
    { n: 'sticker', a: 's, stickers', d: 'Convertir imagen/video a sticker.', r: '🖼️' },
    { n: 'stickeradd', a: 'addsticker', d: 'Agrega sticker a paquete.', r: '➕' },
    { n: 'stickerdel', a: 'delsticker', d: 'Elimina sticker de paquete.', r: '➖' },
    { n: 'stickerpacks', a: 'packlist', d: 'Lista de tus paquetes de stickers.', r: '📋' }
  ],
  gacha: [
    { n: 'buycharacter', a: 'buychar, buyc', d: 'Comprar un personaje en venta.', r: '🛒' },
    { n: 'charimage', a: 'waifuimage, cimage, wimage', d: 'Ver imagen de un personaje.', r: '🖼️' },
    { n: 'charinfo', a: 'winfo, waifuinfo', d: 'Ver información de un personaje.', r: 'ℹ️' },
    { n: 'charvideo', a: 'waifuvideo, cvideo, wvideo', d: 'Ver un video de un personaje.', r: '🎬' },
    { n: 'claim', a: 'c, reclamar', d: 'Reclamar un personaje.', r: '💖' },
    { n: 'delclaimmsg', a: '', d: 'Restablecer mensaje de claim.', r: '🔄' },
    { n: 'deletewaifu', a: 'delwaifu, delchar', d: 'Eliminar un personaje reclamado.', r: '🗑️' },
    { n: 'favoritetop', a: 'favtop', d: 'Ver el top de personajes favoritos.', r: '⭐' },
    { n: 'gachainfo', a: 'ginfo, infogacha', d: 'Ver tu información de gacha.', r: '📊' },
    { n: 'giveallharem', a: '', d: 'Regalar todos tus personajes a otro usuario.', r: '🎁' },
    { n: 'givechar', a: 'givewaifu, regalar', d: 'Regalar un personaje a otro usuario.', r: '💝' },
    { n: 'harem', a: 'waifus, claims', d: 'Ver tus personajes reclamados.', r: '💕' },
    { n: 'haremshop', a: 'tiendawaifus, wshop', d: 'Ver personasjes en venta.', r: '🏪' },
    { n: 'removesale', a: 'removerventa', d: 'Eliminar un personaje en venta.', r: '❌' },
    { n: 'rollwaifu', a: 'rw, roll', d: 'Waifu o husbando aleatorio.', r: '🎲' },
    { n: 'sell', a: 'vender', d: 'Poner un personaje a la venta.', r: '🏷️' },
    { n: 'serieinfo', a: 'ainfo, animeinfo', d: 'Información de un anime.', r: '📺' },
    { n: 'serielist', a: 'slist, animelist', d: 'Listar series del bot.', r: '📚' },
    { n: 'setclaimmsg', a: 'setclaim', d: 'Modificar mensaje al reclamar.', r: '✍️' },
    { n: 'trade', a: 'intercambiar', d: 'Intercambiar un personaje.', r: '🔄' },
    { n: 'vote', a: 'votar', d: 'Votar por un personaje.', r: '👍' },
    { n: 'waifusboard', a: 'waifustop, topwaifus, wtop', d: 'Top de personajes con mayor valor.', r: '📈' }
  ],
  descargas: [
    { n: 'facebook', a: 'fb', d: 'Descargar un video de Facebook.', r: '⬇️' },
    { n: 'hitomi', a: 'hitomila', d: 'Descargar de hitomi.', r: '🔞' },
    { n: 'mediafire', a: 'mf', d: 'Descargar un archivo de MediaFire.', r: '🔥' },
    { n: 'mp4', a: 'ytmp4, mp4doc', d: 'Descargar un video de YouTube.', r: '🎥' },
    { n: 'nhentai', a: 'nh, nhdl', d: 'Descarga de nhentai.', r: '🔞' },
    { n: 'pinterest', a: 'pin', d: 'Buscar y descargar imagenes de Pinterest.', r: '📌' },
    { n: 'play', a: 'yt, ytaudio, playaudio', d: 'Descargar una cancion de YouTube.', r: '🎵' },
    { n: 'reel', a: 'ig, instagram', d: 'Descargar un reel de Instagram.', r: '📸' },
    { n: 'tiktok', a: 'tt', d: 'Descargar un video de TikTok.', r: '🎵' },
    { n: 'twitter', a: 'x', d: 'Descargar un video de Twitter/X.', r: '🐦' },
    { n: 'vermangasporno', a: 'vmp', d: 'Descargar un manga de VMP.', r: '🔞' },
    { n: 'ytsearch', a: 'search', d: 'Buscar videos de YouTube.', r: '🔍' }
  ],
  perfiles: [
    { n: 'allbirthdays', a: 'allbirths', d: 'Ver todos los cumpleaños.', r: '🎂' },
    { n: 'birthdays', a: 'cumpleaños, births', d: 'Ver cumpleaños cercanos.', r: '🎈' },
    { n: 'delbirth', a: '', d: 'Borrar tu fecha de cumpleaños.', r: '❌' },
    { n: 'delgenre', a: '', d: 'Eliminar tu genero.', r: '❌' },
    { n: 'divorce', a: '', d: 'Divorciarte de tu pareja.', r: '💔' },
    { n: 'gp', a: 'group', d: 'Informacion del grupo.', r: '👥' },
    { n: 'leaderboard', a: 'lboard, top', d: 'Top de usuarios con más experiencia.', r: '🏆' },
    { n: 'level', a: 'lvl', d: 'Ver tu nivel y experiencia actual.', r: '📈' },
    { n: 'marry', a: 'casarse', d: 'Casarte con alguien.', r: '💍' },
    { n: 'profile', a: '', d: 'Ver tu perfil.', r: '👤' },
    { n: 'setbirth', a: '', d: 'Establecer tu fecha de cumpleaños.', r: '📅' },
    { n: 'setdescription', a: 'setdesc', d: 'Establecer tu descripcion.', r: '📝' },
    { n: 'setfavourite', a: 'setfav', d: 'Establecer tu claim favorito.', r: '⭐' },
    { n: 'setgenre', a: '', d: 'Establecer tu genero.', r: '🚻' }
  ],
  subbots: [
    { n: 'autojoin', a: '', d: 'Unirse automáticamente a grupos del dueño.', r: '⚙️' },
    { n: 'botinfo', a: 'infobot', d: 'Obtener informacion del bot', r: '🤖' },
    { n: 'join', a: '', d: 'Unir al bot a un grupo', r: '📥' },
    { n: 'leave', a: 'salir', d: 'Salir de un grupo', r: '🚪' },
    { n: 'logout', a: '', d: 'Cerrar sesion del bot', r: '🔌' },
    { n: 'qr', a: 'code', d: 'Crear un Sub-Bot con un codigo QR/Code', r: '📱' },
    { n: 'qrpremium', a: 'codepremium', d: 'Crear un sub-bot premium', r: '💎' },
    { n: 'qrtemporal', a: 'codetemporal', d: 'Crear un Sub-Bot temporal', r: '⏳' },
    { n: 'reload', a: '', d: 'Recargar la sesion del bot', r: '🔄' },
    { n: 'setbanner', a: 'setmenubanner', d: 'Cambiar el banner del menu', r: '🖼️' },
    { n: 'setbotcurrency', a: '', d: 'Cambiar la moneda del bot', r: '💰' },
    { n: 'setbotowner', a: '', d: 'Cambiar el dueño del bot', r: '👑' },
    { n: 'setname', a: 'setbotname', d: 'Cambiar el nombre del bot', r: '🏷️' },
    { n: 'setpfp', a: 'setimage', d: 'Cambiar la imagen de perfil', r: '📸' },
    { n: 'setstatus', a: '', d: 'Cambiar el estado del bot', r: '💬' },
    { n: 'setusername', a: '', d: 'Cambiar el nombre de usuario', r: '👤' }
  ],
  utilidad: [
    { n: 'bots', a: 'sockets', d: 'Ver el numero de bots activos.', r: '🤖' },
    { n: 'getpic', a: 'pfp', d: 'Ver la foto de perfil de un usuario.', r: '📸' },
    { n: 'invite', a: '', d: 'Invitar al bot a un grupo.', r: '💌' },
    { n: 'status', a: '', d: 'Ver estado del bot', r: '📊' },
    { n: 'suggest', a: 'add, addanime, report', d: 'Solicitar un anime/personaje', r: '💡' },
    { n: 'testwelcome', a: 'testgoodbye', d: 'Prueba el mensaje de bienvenida.', r: '👋' },
    { n: 'toimage', a: 'toimg', d: 'Convertir un sticker a imagen.', r: '🖼️' }
  ],
  admin: [
    { n: 'alerts', a: 'alertas', d: 'Activar/desactivar las alertas', r: '🔔' },
    { n: 'antilink', a: 'antienlace', d: 'Activar/desactivar el antienlace', r: '🔗' },
    { n: 'bot', a: '', d: 'Activar/desactivar al bot', r: '🤖' },
    { n: 'close', a: '', d: 'Cerrar el grupo para admins.', r: '🔒' },
    { n: 'delwarn', a: '', d: 'Eliminar advertencia.', r: '➖' },
    { n: 'demote', a: '', d: 'Descender de administrador.', r: '⬇️' },
    { n: 'economy', a: 'economia', d: 'Activar comandos economía.', r: '💰' },
    { n: 'gacha', a: '', d: 'Activar comandos GACHA.', r: '🎲' },
    { n: 'goodbye', a: 'despedida', d: 'Activar la despedida', r: '👋' },
    { n: 'groupimage', a: 'groupimg, gpimg, setgroupimage', d: 'Cambiar imagen de grupo.', r: '🖼️' },
    { n: 'kick', a: '', d: 'Expulsar del grupo.', r: '🔪' },
    { n: 'msgcount', a: 'count, messages, mensajes', d: 'Contador de mensajes.', r: '📊' },
    { n: 'nsfw', a: '', d: 'Activar comandos NSFW.', r: '🔞' },
    { n: 'onlyadmin', a: 'onlyadmins', d: 'Permitir solo a admins usar comandos.', r: '👑' },
    { n: 'open', a: '', d: 'Abrir el grupo.', r: '🔓' },
    { n: 'promote', a: '', d: 'Ascender a administrador.', r: '⬆️' },
    { n: 'setgoodbye', a: '', d: 'Establecer mensaje de despedida.', r: '📝' },
    { n: 'setprimary', a: '', d: 'Establece bot primario.', r: '⭐' },
    { n: 'setwarnlimit', a: '', d: 'Límite de advertencias.', r: '⚠️' },
    { n: 'setwelcome', a: '', d: 'Establecer mensaje de bienvenida.', r: '📝' },
    { n: 'tag', a: 'hidetag, tagsay, tagall', d: 'Mencionar a todos.', r: '📢' },
    { n: 'topcount', a: 'topmessages, topmsgcount, topmensajes', d: 'Top de usuarios activos.', r: '🏆' },
    { n: 'topinactive', a: 'topinactivos, topinactiveusers', d: 'Top usuarios inactivos.', r: '💤' },
    { n: 'warn', a: '', d: 'Advertir a un miembro.', r: '⚠️' },
    { n: 'warns', a: '', d: 'Ver advertencias de miembro.', r: '📋' },
    { n: 'welcome', a: 'bienvenida', d: 'Activar la bienvenida', r: '👋' }
  ]
};

function generateComplexStubs() {
  for (const [category, cmds] of Object.entries(complexCommands)) {
    const dir = path.join(PLUGINS_DIR, category);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    for (const cmd of cmds) {
      const filePath = path.join(dir, `${cmd.n}.js`);
      if (fs.existsSync(filePath)) continue;
      
      const aliasLine = cmd.a ? `// @alias: ${cmd.a}` : '';
      
      const content = `// @nombre: ${cmd.n}
${aliasLine}
// @categoria: ${category}
// @descripcion: ${cmd.d}
// @reaccion: ${cmd.r}

export default async function(m, ctx) {
  // STUB: Mantiene la presencia en el menu mientras la lógica es desarrollada.
  await ctx.reply('✨ *${cmd.n.toUpperCase()}* está en desarrollo... 🛠️');
}
`;
      fs.writeFileSync(filePath, content.replace(/\n\n\/\//g, '\n//'), 'utf-8');
      console.log(`Creado stub: ${category}/${cmd.n}.js`);
    }
  }
}

generateComplexStubs();
console.log('Generacion de stubs terminada.');
