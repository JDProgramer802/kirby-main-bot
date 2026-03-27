// @nombre: ping
// @alias: ping, p
// @categoria: utilidad
// @descripcion: Medir el tiempo de respuesta del bot.
// @reaccion: 🏓

export default async function (m, { conn }) {
  try {
    const start = Date.now();

    // 🌸 Mensaje inicial
    const sent = await conn.sendMessage(m.key.remoteJid, {
      text: '```(づ｡◕‿‿◕｡)づ midiendo latencia...```'
    }, { quoted: m });

    const latency = Date.now() - start;

    // 🔥 DETECCIÓN PRO DE JID (soporta @lid)
    const participant =
      sent.key.participant ||
      m.key?.participant ||
      m.sender ||
      undefined;

    // 🔥 KEY SEGURO
    const safeKey = {
      remoteJid: sent.key.remoteJid,
      fromMe: sent.key.fromMe,
      id: sent.key.id,
      ...(participant ? { participant } : {}) // solo si existe
    };

    // 🌸 Mensaje final kawaii
    const textFinal =
`♡﹒𓏲 kirby ping system 𓏲﹒♡

┊ *estado*   :: _online_
┊ *latencia* :: \`${latency} ms\`
┊ *modo*     :: _dreamland_

୨୧﹒todo funcionando bonito ✿`;

    // ✨ Intentar editar (con fallback por si algo falla)
    try {
      await conn.sendMessage(m.key.remoteJid, {
        text: textFinal,
        edit: safeKey
      });
    } catch (e) {
      // ⚠️ fallback seguro (evita crash total)
      await conn.sendMessage(m.key.remoteJid, {
        text: textFinal
      }, { quoted: m });
    }
  } catch (error) {
    // 🛡️ Manejo de errores de conexión
    if (error.message?.includes('Connection Closed') || error.message?.includes('connection closed')) {
      // Enviar mensaje simple sin quoted para evitar más errores
      await conn.sendMessage(m.key.remoteJid, {
        text: `♡﹒𓏲 kirby ping system 𓏲﹒♡\n\n┊ *estado* :: _conexión inestable_\n┊ *latencia* :: _desconocida_\n┊ *modo* :: _dreamland_\n\n୨୧﹒reintentando conexión... ✿`
      }).catch(() => {
        // Si ni siquiera puede enviar mensaje, silenciar el error
      });
    } else {
      // Re-throw otros errores para que sean manejados por el handler
      throw error;
    }
  }
}