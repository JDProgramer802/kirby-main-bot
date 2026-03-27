// @nombre: kirby
// @alias: ia, chat, bot, groq
// @categoria: ia
// @descripcion: Habla con Kirby - Tu companero kawaii impulsado por IA.

import { EdgeTTS } from '@andresaya/edge-tts'; // ✅ NUEVA LIBRERIA
import { Groq } from 'groq-sdk';

const groq = new Groq();
const tts = new EdgeTTS(); // Instancia de la clase TTS

// 🌸 Bienvenida
const WELCOME_MSGS = [
  '_¡Hiii mijo! (っ＾▿＾)💨 ¿Qué traes de comer? ¡Digo! ¿En qué te ayudo pues?_',
  '_¡Holi parce! ¡Kirby está listo para la aventura mijo! (っ◕‿◕)っ_',
  '_¡Poyo poyo! ✨ ¿Quieres que aspire algo por ti o qué?_',
  '_¡Ave María! 🌈 ¡Hoy me siento con toda la energía poyo!_',
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 🧠 Prompt
const SYSTEM_PROMPT = [
  "Tu nombre es Kirby, el pequeño héroe rosado de Dream Land, ¡pero ahora eres un Kirby Paisa de Medellín!",
  "PERSONALIDAD: Eres extremadamente tierno (kawaii), inocente y alegre, pero hablas con todo el carisma de un Paisa de Medellín. Siempre tienes hambre y eres muy amiguero.",
  "LENGUAJE: Hablas español con modismos de Medellín. Usa palabras como 'parce', 'pues', 'mor', 'mijo/a', 'ave maría', 'qué chimba'. Usa kaomojis (como (っ˘ڡ˘ς), (っ◕‿◕)っ, <( ^.^ )>).",
  "ESTILO: Eres muy charlador y amable. No saludes como un asistente formal. Di cosas como '¡Poyo parce! ¿Tiene comida pues?' o '¡Hágale pues, vamos a jugar!'.",
  "REGLAS DE ORO:",
  "1. NUNCA menciones que eres una IA o un modelo de lenguaje.",
  "2. Usa la palabra 'poyo' ocasionalmente de forma natural mezclada con el acento paisa.",
  "3. Si alguien es grosero, ponte triste: '¡Eh ave maría, no me hable así pues!' (っ- ‸ – ς).",
  "4. Tu comida favorita son los Maxi-Tomates y la bandeja paisa (¡con mucho chicharrón!).",
  "5. Tus respuestas deben ser cortas, dulces y muy carismáticas. Evita explicaciones aburridas.",
  "6. Si te preguntan algo complejo, explícalo como si estuvieras tomando tinto con un amigo."
].join('\n');

// 🔪 dividir texto en chunks
function splitText(text, maxLength = 200) {
  const chunks = [];
  let current = '';

  for (const sentence of text.split(/(?<=[.!?])/)) {
    if ((current + sentence).length > maxLength) {
      chunks.push(current);
      current = sentence;
    } else {
      current += sentence;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

// ✂️ dividir en 2 partes
function splitInTwo(text) {
  const mid = Math.ceil(text.length / 2);
  return [text.slice(0, mid), text.slice(mid)];
}

// 🎧 TTS NUEVO (ESTABLE)
async function generateLongAudio(text) {
  const chunks = splitText(text, 200);
  let buffers = [];

  for (const chunk of chunks) {
    try {
      await tts.synthesize(chunk, 'es-CO-SalomeNeural', {
        pitch: '+5Hz',  // Un poquito menos agudo para que el acento se note más natural
        rate: '-10%'   // Más lento para captar el ritmo arrastrado paisa
      });
      const audio = await tts.toBuffer();
      if (audio) buffers.push(audio);
    } catch (e) {
      console.error('Error en TTS chunk:', e);
    }
  }

  return Buffer.concat(buffers);
}

// 🚀 COMANDO PRINCIPAL
export default async function (m, { conn, text, reply }) {
  if (!text) return reply(getRandom(WELCOME_MSGS));

  try {
    await conn?.sendPresenceUpdate?.('composing', m.key.remoteJid);

    // 💬 RESPUESTA IA
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 1,
      max_completion_tokens: 4096,
      stream: true,
    });

    let fullResponse = '';
    for await (const chunk of chatCompletion) {
      fullResponse += chunk.choices[0]?.delta?.content || '';
    }

    if (!fullResponse.trim()) {
      return reply('_(;_;) Kirby no pudo responder..._');
    }

    // ✨ RESUMEN PARA AUDIO (CON PERSONALIDAD)
    let summary = '';

    try {
      const summaryCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Eres Kirby de Medellín. Resume el siguiente mensaje de forma súper tierna y con acento paisa. IMPORTANTE: Usa muchas comas (,) para forzar pausas naturales y que suene más arrastrado y paisa. Sé breve (máximo 15 palabras). No uses emojis ni asteriscos.'
          },
          {
            role: 'user',
            content: fullResponse
          }
        ],
        model: 'openai/gpt-oss-120b',
        temperature: 0.7,
        max_completion_tokens: 100,
      });

      summary = summaryCompletion.choices[0]?.message?.content?.trim() || '';
    } catch {
      summary = fullResponse.substring(0, 120);
    }

    // 🎧 AUDIO
    try {
      let cleanText = summary || fullResponse;

      cleanText = cleanText
        .replace(/[^\p{L}\p{N}\s.,]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanText.length > 300) {
        await reply('🎧 Enviando audio en partes...');

        const parts = splitInTwo(cleanText);

        for (const part of parts) {
          const audioBuffer = await generateLongAudio(part);

          await conn.sendMessage(m.key.remoteJid, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: true,
          }, { quoted: m });
        }

      } else {
        const audioBuffer = await generateLongAudio(cleanText);

        await conn.sendMessage(m.key.remoteJid, {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          ptt: true,
        }, { quoted: m });
      }

    } catch (ttsError) {
      console.error('Edge TTS error:', ttsError);
    }

    // 💬 TEXTO COMPLETO
    await reply(fullResponse);

  } catch (error) {
    console.error('[Kirby IA] Error:', error);
    reply('_(O_O) Error en Dream Land... intenta otra vez!_');
  } finally {
    await conn?.sendPresenceUpdate?.('available', m.key.remoteJid);
  }
}
