import fs from 'fs';
import path from 'path';

const PLUGINS_DIR = 'C:\\laragon\\www\\kirby-pro\\plugins';

const animeCommands = [
  { n: 'angry', a: 'enojado', d: 'Estar enojado', r: '😡', txt: ['está muy enojado con', 'se enfureció con', 'está molesto con', 'le lanza una mirada letal a', 'no quiere ver ni en pintura a', 'le hace un berrinche a'] },
  { n: 'bath', a: '', d: 'Bañarse', r: '🛁', txt: ['se está bañando con', 'toma un baño relajante con', 'disfruta del agua con', 'se talla la espalda con', 'juega con burbujas junto a', 'se relaja en el jacuzzi con'] },
  { n: 'bite', a: '', d: 'Muerde a alguien', r: '🧛', txt: ['mordió a', 'le dio un mordisquito a', 'clavo sus dientes en', 'le dio una mordida juguetona a', 'le marcó los dientes a', 'muerde cariñosamente a'] },
  { n: 'bleh', a: '', d: 'Sacar la lengua', r: '😛', txt: ['le sacó la lengua a', 'le hace burla a', 'se burla de', 'le hace una mueca a', 'se ríe en la cara de'] },
  { n: 'blush', a: '', d: 'Sonrojarte', r: '😳', txt: ['se sonrojó por', 'está muy apenado por', 'se puso rojo por', 'no puede ocultar su vergüenza ante', 'se siente halagado por', 'se puso como un tomate por'] },
  { n: 'bored', a: 'aburrido', d: 'Estar aburrido', r: '🥱', txt: ['está aburrido con', 'no tiene nada que hacer con', 'se bosteza junto a', 'necesita algo de acción con', 'se siente ignorado por'] },
  { n: 'call', a: '', d: 'Llamar a alguien', r: '📞', txt: ['llamó a', 'está llamando a', 'quiere hablar con', 'necesita decirte algo a', 'te está marcando'] },
  { n: 'clap', a: 'aplaudir', d: 'Aplaudir', r: '👏', txt: ['le aplaudió a', 'aplaude emocionado por', 'celebra los logros de', 'le da una ovación a', 'está orgulloso de'] },
  { n: 'coffee', a: 'cafe', d: 'Tomar cafe', r: '☕', txt: ['está tomando café con', 'disfruta de un café con', 'invitó un café a', 'comparte un momento cafeinado con', 'se toma un latte con'] },
  { n: 'cold', a: '', d: 'Tener frío', r: '🥶', txt: ['tiene mucho frío junto a', 'tiembla de frío con', 'busca calor con', 'se congela al lado de', 'necesita una manta con'] },
  { n: 'cook', a: '', d: 'Cocinar algo delicioso', r: '🍳', txt: ['está cocinando para', 'prepara algo rico para', 'es el chef de', 'le hizo un banquete a', 'cocina con amor para'] },
  { n: 'cry', a: '', d: 'Llorar por algo o alguien', r: '😭', txt: ['está llorando por', 'derrama lágrimas por', 'está muy triste por', 'necesita un consuelo de', 'se desahoga con'] },
  { n: 'cuddle', a: 'acurrucarse', d: 'Acurrucarse', r: '🤗', txt: ['se acurrucó con', 'busca mimos de', 'está muy pegadito a', 'se siente seguro con', 'duerme pegadito a', 'le encanta estar con'] },
  { n: 'dance', a: 'bailar', d: 'Bailar', r: '💃', txt: ['está bailando con', 'saca sus mejores pasos con', 'disfruta del ritmo con', 'mueve el cuerpo con', 'baila toda la noche con'] },
  { n: 'dramatic', a: 'drama', d: 'Drama', r: '🎭', txt: ['está haciendo un drama por', 'es muy dramático con', 'exagera todo con', 'montó una escena para', 'es toda una reina del drama con'] },
  { n: 'draw', a: '', d: 'Dibujar', r: '🎨', txt: ['dibujó a', 'hizo un retrato de', 'retrató a', 'hizo un boceto de', 'pinta una obra de arte de'] },
  { n: 'drunk', a: '', d: 'Estar borracho', r: '🍺', txt: ['está muy borracho con', 'bebió de más con', 'está ebrio junto a', 've doble a', 'no puede ni caminar con'] },
  { n: 'eat', a: 'comer', d: 'Comer algo delicioso', r: '🍔', txt: ['está comiendo con', 'devora comida con', 'disfruta un banquete con', 'comparte su pizza con', 'se atiborra de dulces con'] },
  { n: 'facepalm', a: '', d: 'Facepalm', r: '🤦‍♂️', txt: ['se dio un facepalm por', 'no puede creer lo de', 'se decepcionó de', 'está harto de las tonterías de', 'se golpea la frente por'] },
  { n: 'gaming', a: '', d: 'Jugar videojuegos', r: '🎮', txt: ['está jugando videojuegos con', 'le gana en el juego a', 'está viciado con', 'hace un stream con', 'juega una partida épica con'] },
  { n: 'greet', a: 'hi', d: 'Saludar a alguien', r: '👋', txt: ['saludó a', 'le da la bienvenida a', 'dice hola a', 'le hace una señal a', 'le sonríe a'] },
  { n: 'happy', a: 'feliz', d: 'Salta de felicidad', r: '😁', txt: ['está muy feliz con', 'salta de alegría por', 'irradia felicidad con', 'está de lo más contento con', 'sonríe de oreja a oreja por'] },
  { n: 'heat', a: '', d: 'Tener calor', r: '🥵', txt: ['tiene mucho calor junto a', 'se está asando con', 'necesita aire con', 'suda la gota gorda con', 'muere de calor con'] },
  { n: 'hug', a: 'abrazo', d: 'Abrazar', r: '🫂', txt: ['le dio un gran abrazo a', 'abraza fuertemente a', 'le dio un abrazo cálido a', 'necesita un abrazo de', 'le da un abrazo de oso a', 'se aferra en un abrazo a'] },
  { n: 'jump', a: '', d: 'Saltar', r: '🦘', txt: ['saltó sobre', 'está brincando con', 'salta de emoción con', 'brinca como loco por', 'le dio un salto a'] },
  { n: 'kill', a: '', d: 'Matar', r: '🔪', txt: ['mató a', 'acabó con la vida de', 'eliminó a', 'le dio cuello a', 'lo mandó al lobby a'] },
  { n: 'kiss', a: 'beso', d: 'Besar', r: '💋', txt: ['le dio un tierno beso a', 'besó apasionadamente a', 'le robó un beso a', 'le dio un beso de amor a', 'disfruta de los labios de'] },
  { n: 'kisscheek', a: 'beso', d: 'Beso en la mejilla', r: '😘', txt: ['le dio un beso en la mejilla a', 'saluda con un beso a', 'le dio un besito a', 'mima con un beso a'] },
  { n: 'laugh', a: '', d: 'Reírte', r: '😂', txt: ['se está riendo de', 'se muerde de risa con', 'no para de reír con', 'se burla a carcajadas de', 'muere de la risa con'] },
  { n: 'lewd', a: '', d: 'Lascivo', r: '😏', txt: ['tiene pensamientos lascivos con', 'mira pícaramente a', 'está muy pervertido con', 'quiere hacer cosas sucias con', 'le lanza una mirada hot a'] },
  { n: 'lick', a: '', d: 'Lamer', r: '👅', txt: ['lamió a', 'le dio una lamiada a', 'saboreó a', 'le pasa la lengua a', 'disfruta el sabor de'] },
  { n: 'love', a: 'amor', d: 'Amor', r: '❤️', txt: ['siente mucho amor por', 'está enamorado de', 'ama profundamente a', 'daría la vida por', 'está loquito por'] },
  { n: 'nope', a: '', d: 'Negarse', r: '🙅', txt: ['se negó contundentemente con', 'dijo que no a', 'rechazó a', 'le hizo la ley del hielo a', 'no está de acuerdo con'] },
  { n: 'pat', a: 'caricia', d: 'Acariciar', r: '✨', txt: ['acarició suavemente a', 'le dio palmaditas a', 'consiente a', 'le hace piojito a', 'mima la cabeza de'] },
  { n: 'poke', a: 'picar', d: 'Picar', r: '👉', txt: ['le picó la mejilla a', 'está molestando a', 'le pica a', 'no deja de picar a', 'provoca a'] },
  { n: 'pout', a: '', d: 'Pucheros', r: '😤', txt: ['le hace pucheros a', 'se puso caprichoso con', 'está muy molesto con', 'le hace un gesto tierno a', 'se enfunó con'] },
  { n: 'psycho', a: '', d: 'Psicópata', r: '👹', txt: ['se volvió psicópata con', 'tiene una mirada aterradora para', 'está loco por', 'le da miedo a', 'perdió la razón con'] },
  { n: 'punch', a: '', d: 'Puñetazo', r: '👊', txt: ['le dio un puñetazo a', 'golpeó a', 'le soltó un buen golpe a', 'le dio un bife a', 'noqueó a'] },
  { n: 'push', a: '', d: 'Empujar', r: '🤚', txt: ['empujó a', 'alejó a', 'le dio un empujón a', 'le hace el feo a', 'quita de su camino a'] },
  { n: 'run', a: '', d: 'Correr', r: '🏃‍♂️', txt: ['salió corriendo de', 'escapa de', 'está huyendo de', 'no quiere que lo atrapen por', 'corre por su vida de'] },
  { n: 'sad', a: 'triste', d: 'Triste', r: '😔', txt: ['está triste por', 'se siente desanimado con', 'está deprimido por', 'necesita un abrazo de', 'está de bajón con'] },
  { n: 'scared', a: '', d: 'Asustado', r: '😱', txt: ['está muy asustado de', 'tiembla de miedo ante', 'tiene pánico por', 'se esconde de', 'está aterrado con'] },
  { n: 'scream', a: '', d: 'Gritar', r: '🗣️', txt: ['le gritó a', 'perdió los estribos con', 'le pega un grito a', 'le reclama a gritos a', 'está furioso con'] },
  { n: 'seduce', a: '', d: 'Seducir', r: '😍', txt: ['está seduciendo a', 'coquetea con', 'intenta conquistar a', 'le lanza el perro a', 'está de casanova con'] },
  { n: 'shy', a: 'timido', d: 'Tímido', r: '😳', txt: ['siente mucha timidez con', 'se esconde tímidamente de', 'está apenado con', 'no puede ver a los ojos a', 'se sonrojó por culpa de'] },
  { n: 'sing', a: '', d: 'Cantar', r: '🎤', txt: ['le está cantando a', 'entona una melodía para', 'es el cantante favorito de', 'le dedica una canción a', 'da un concierto para'] },
  { n: 'slap', a: 'bofetada', d: 'Bofetada', r: '👋', txt: ['le dio una bofetada a', 'le cruzó la cara a', 'le soltó una cachetada a', 'dejó la mano marcada en', 'le dio un tortazo a'] },
  { n: 'sleep', a: '', d: 'Dormir', r: '😴', txt: ['se quedó dormido junto a', 'ronca al lado de', 'sueña con', 'toma una siesta con', 'está en el quinto sueño con'] },
  { n: 'smoke', a: '', d: 'Fumar', r: '🚬', txt: ['está fumando con', 'prende un cigarrillo con', 'está relajado con', 'comparte un puro con', 'lanza humo a'] },
  { n: 'spit', a: 'escupir', d: 'Escupir', r: '💦', txt: ['escupió a', 'le lanzó un gargajo a', 'despreció a', 'le mostró su asco a'] },
  { n: 'step', a: 'pisar', d: 'Pisar', r: '👢', txt: ['pisó a', 'le puso el pie encima a', 'aplastó a', 'domina en el suelo a'] },
  { n: 'think', a: '', d: 'Pensar', r: '🤔', txt: ['está pensando profundamente en', 'reflexiona sobre', 'tiene dudas sobre', 'está ideando un plan con'] },
  { n: 'tickle', a: '', d: 'Cosquillas', r: '🤣', txt: ['le hizo cosquillas a', 'no para de hacerle mimos a', 'muere de risa haciéndole cosquillas a', 'le tortura con risas a'] },
  { n: 'walk', a: '', d: 'Caminar', r: '🚶', txt: ['salió a caminar con', 'pasea junto a', 'da una vuelta con', 'camina de la mano de'] }
];

const nsfwCommands = [
  { n: 'anal', a: '', d: 'Anal', r: '🔞', txt: ['le está haciendo un anal a', 'está disfrutando un anal con', 'dominando por detrás a', 'le da duro por el asterisco a', 'le explora el túnel a'] },
  { n: 'ass', a: 'poto', d: 'Trasero', r: '🍑', txt: ['le muestra su trasero a', 'se menea para', 'le enseña el culo a', 'le da nalgadas a', 'pone su culito frente a'] },
  { n: 'blowjob', a: 'mamada, bj', d: 'Mamada', r: '🔞', txt: ['le está haciendo una mamada a', 'se la chupa a', 'disfruta del sabor de', 'le limpia el palo a', 'se atraganta con la leche de'] },
  { n: 'boobjob', a: '', d: 'Rusa', r: '🍒', txt: ['le está haciendo una rusa a', 'le aprieta el pene con sus tetas a', 'disfruta entre sus pechos con', 'le hace un pajote con las tetas a'] },
  { n: 'cum', a: '', d: 'Venirse', r: '💦', txt: ['se corrió en', 'acabó dentro de', 'no aguantó más con', 'empapó de semen a', 'se vació en'] },
  { n: 'cummouth', a: '', d: 'Acabar boca', r: '👄', txt: ['acabó en la boca de', 'le llenó la boca a', 'le dio leche de beber a', 'le hizo tragar todo a'] },
  { n: 'cumshot', a: '', d: 'Disparar semen', r: '💦', txt: ['le dio un cumshot a', 'le disparó su leche a', 'bañó en semen a', 'le hizo un facial a'] },
  { n: 'fap', a: 'paja', d: 'Fap', r: '🍆', txt: ['se está haciendo una paja pensando en', 'se masturba por', 'le dedica una paja a', 'se manosea por culpa de'] },
  { n: 'footjob', a: '', d: 'Footjob', r: '🦶', txt: ['le hace un footjob a', 'le menea el pene con los pies a', 'disfruta de sus pies con', 'usa sus plantas para calentar a'] },
  { n: 'fuck', a: 'coger', d: 'Fuck', r: '👉👌', txt: ['se está follando a', 'se coge a', 'le da duro a', 'lo hace con pasión con', 'le rompe el orto a'] },
  { n: 'grabboobs', a: '', d: 'Agarrar tetas', r: '🍒', txt: ['le agarró las tetas a', 'no suelta los pechos de', 'manosea las tetas de', 'estruja los melones de'] },
  { n: 'grope', a: '', d: 'Manosear', r: '🖐️', txt: ['manoseó a', 'está explorando el cuerpo de', 'no puede dejar de tocar a', 'le mete mano a'] },
  { n: 'handjob', a: '', d: 'Paja', r: '🖐️', txt: ['le está haciendo una paja a', 'le menea el palo a', 'usa sus manos con', 'le da un pajazo a'] },
  { n: 'lickass', a: '', d: 'Lamer culo', r: '👅', txt: ['le está lamiendo el culo a', 'disfruta de su anito con', 'le chupa el poto a', 'le limpia el nudo a'] },
  { n: 'lickdick', a: '', d: 'Lamer pene', r: '👅', txt: ['le está lamiendo el pene a', 'se lo saborea a', 'chupa suavemente el palo de', 'disfruta de la cabecita de'] },
  { n: 'lickpussy', a: '', d: 'Lamer coño', r: '👅', txt: ['le está chupando el coño a', 'saborea su intimidad con', 'está comiendo el pastel a', 'le lame el clítoris a'] },
  { n: 'sixnine', a: '69', d: '69', r: '♋', txt: ['hizo un 69 con', 'está en un 69 con', 'se saborean mutuamente en un 69 con', 'se chupan todo en el 69 con'] },
  { n: 'spank', a: 'nalgada', d: 'Spank', r: '👋', txt: ['le dio una nalgada a', 'le azotó el culo a', 'le dejó la marca a', 'le pone el poto rojo a'] },
  { n: 'suckboobs', a: '', d: 'Chupar tetas', r: '👅', txt: ['le está chupando las tetas a', 'succiona sus pechos a', 'disfruta de sus tetas a', 'le muerde los pezones a'] },
  { n: 'undress', a: 'encuerar', d: 'Desnudar', r: '👗', txt: ['desnudó a', 'le quitó la ropa a', 'dejó al descubierto a', 'le quitó hasta los calzones a'] },
  { n: 'yuri', a: 'tijeras', d: 'Yuri', r: '✂️', txt: ['está tijereando con', 'hace tijeras con', 'disfruta de su feminidad con', 'se frota las almejas con'] }
];

function generate(list, category, typeOfAction) {
  const dir = path.join(PLUGINS_DIR, category);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const cmd of list) {
    const filePath = path.join(dir, `${cmd.n}.js`);
    
    const aliasLine = cmd.a ? `// @alias: ${cmd.a}` : '';
    const txtPool = JSON.stringify(cmd.txt);
    
    const content = `// @nombre: ${cmd.n}
${aliasLine}
// @categoria: ${category}
// @descripcion: ${cmd.d}
// @reaccion: ${cmd.r}

import { reactionAction } from '../../src/lib/utils.js';

export default async function(m, ctx) {
  await reactionAction(m, ctx, '${typeOfAction}', '${cmd.n.replace('kisscheek', 'kiss')}', ${txtPool});
}
`;
    fs.writeFileSync(filePath, content.replace(/\n\n\/\//g, '\n//'), 'utf-8');
    console.log(`Generado con variedad MAXIMA: ${category}/${cmd.n}.js`);
  }
}

generate(animeCommands, 'anime', 'sfw');
generate(nsfwCommands, 'nsfw', 'nsfw');

console.log('Variedad MAXIMA añadida a las reacciones.');
