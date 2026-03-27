# 🌸✨ Kirby Dream Bot - WhatsApp Bot ✨🌸

<div align="center">

![Kirby Bot](https://img.shields.io/badge/Kirby-Dream-Bot-blue?style=for-the-badge&logo=whatsapp)
![Version](https://img.shields.io/badge/version-2.0-green?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-purple?style=flat-square)
![Node](https://img.shields.io/badge/node-%3E%3C%3D18-blue?style=flat-square)
![JavaScript](https://img.shields.io/badge/javascript-yellow?style=flat-square)

</div>

---

<div align="center">

**🤖 El Bot de WhatsApp más completo y personalizable**  
Con sistema de subbots, economía, gacha, y almacenamiento en la nube

[![GitHub stars](https://img.shields.io/github/stars/JDProgramer802/kirby-main-bot?style=social)](https://github.com/JDProgramer802/kirby-main-bot/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/JDProgramer802/kirby-main-bot?style=social)](https://github.com/JDProgramer802/kirby-main-bot/network)

</div>

---

## 🌟 **Características Principales**

| Característica | Descripción | Estado |
|--------------|-------------|--------|
| 🤖 **Sub-Bots** | Crea y gestiona tus propios bots | ✅ |
| 🌸 **Banners GitHub** | Almacenamiento en la nube con URLs públicas | ✅ |
| 💰 **Economía Completa** | Coins, tienda, trabajos y recompensas | ✅ |
| 🎮 **Gacha System** | Colecciona personajes y waifus exclusivos | ✅ |
| 📱 **Admin Total** | Control completo de grupos y usuarios | ✅ |
| 🔞 **NSFW** | Módulo adulto opcional | ✅ |
| 🎨 **Stickers** | Crea y gestiona packs personalizados | ✅ |
| 📊 **Niveles** | Sistema de experiencia y recompensas | ✅ |
| 🌐 **Multi-API** | GitHub, Imgur, ImgBB, Telegraph | ✅ |
| 🔧 **250+ Comandos** | Sistema modular y extensible | ✅ |

---

## 🚀 **Instalación Rápida**

### **🔥 Método 1: Automático**
```bash
git clone https://github.com/JDProgramer802/kirby-main-bot.git
cd kirby-main-bot
chmod +x scripts/setup.sh
./scripts/setup.sh
npm start
```

### **📦 Método 2: Manual**
```bash
git clone https://github.com/JDProgramer802/kirby-main-bot.git
cd kirby-main-bot
npm install
cp .env.example .env
# 📝 Edita .env con tus credenciales
npm start
```

---

## ⚙️ **Configuración**

### **🔑 Variables de Entorno**

```env
# 🌸 Configuración del Bot
PREFIJO=/
OWNER_NUMBER=38414791536710@lid
BOT_NAME=Kirby Dream Bot
BOT_DEV=Dream Kirby Developer

# 🗄️ Base de Datos PostgreSQL
DATABASE_URL=postgresql://usuario:password@host:5432/database

# 🔑 APIs Externas
IMGBB_API_KEY=tu_api_key_imgbb
GROQ_API_KEY=tu_api_key_groq

# 🌐 Almacenamiento GitHub (Opcional pero recomendado)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=JDProgramer802/kirby-main-bot
BASE_URL=https://raw.githubusercontent.com/JDProgramer802/kirby-main-bot/main
```

### **🔗 Obtener Tokens**

| Servicio | Enlace | Descripción |
|---------|-------|-------------|
| 🔑 **GitHub Token** | [settings/tokens](https://github.com/settings/tokens) | Acceso completo al repositorio |
| 🖼️ **ImgBB API** | [imgbb.com](https://imgbb.com/) | Subida de imágenes rápida |
| 🤖 **Groq API** | [groq.com](https://groq.com/) | IA y procesamiento de lenguaje |

---

## 📁 **Estructura del Proyecto**

```
kirby-pro/
├── 📄 src/lib/              # 🧠 Librerías principales
│   ├── handler.js         # 📨 Manejador de mensajes
│   ├── database.js        # 🗄️ Conexión PostgreSQL  
│   ├── github-storage.js  # 🌐 Almacenamiento GitHub
│   └── config.js          # ⚙️ Configuración
├── 🔌 plugins/              # 🎛 Sistema modular (250+ archivos)
│   ├── admin/            # 👑 Administración
│   ├── subbots/          # 🤖 Gestión de sub-bots
│   ├── anime/            # 🎭 Reacciones anime
│   ├── economia/          # 💰 Sistema económico
│   ├── gacha/            # 🎮 Coleccionables
│   ├── nsfw/             # 🔞 Contenido adulto
│   ├── stickers/          # 🎨 Sistema de stickers
│   └── utilidad/         # 🛠️ Herramientas
├── 📂 scripts/              # 🔧 Scripts de mantenimiento
├── 🌐 public/               # 📁 Archivos públicos
└── 🗂️ tmp/                 # 📄 Archivos temporales
```

---

## 🎮 **Comandos Populares**

### **👑 Administración**
```bash
/menu                    # 📋 Menú principal con banners
/setbanner               # 🌸 Cambiar banner del menú
/setbannerwel             # 🎉 Banner de bienvenida  
/setbannerbye             # 👋 Banner de despedida
/kick @usuario            # 🚫 Expulsar usuario
/promote @usuario          # 👑 Dar administrador
/welcome                 # ✅ Activar bienvenida
/goodbye                 # 👋 Activar despedida
```

### **🤖 Sub-Bots**
```bash
/qr                      # 📱 Generar QR para sub-bot
/code                     # 🔢 Generar código de vinculación
/setname                  # 🏷️ Cambiar nombre
/setpfp                  # 🖼️ Cambiar foto de perfil
/logout                   # 🚪 Desconectar sub-bot
```

### **💰 Economía**
```bash
/balance                  # 💰 Ver balance
/work                     # 💼 Trabajar
/daily                    # 🎁 Recompensa diaria
/shop                     # 🛍 Tienda
/buy @item               # 🛒 Comprar item
```

### **🎨 Utilidades**
```bash
/sticker                  # 🎨 Crear sticker
/ping                     # 🏓 Verificar velocidad
/invite                   # 📧 Link de invitación
/toimage                  # 🖼️ Convertir sticker a imagen
```

---

## 🔧 **Sistema de Almacenamiento**

<div align="center">

**🌐 Multi-Storage con Fallback Automático**

</div>

El bot utiliza múltiples servicios para garantizar que tus banners siempre estén disponibles:

### **🏆 Prioridad 1: GitHub (Recomendado)**
- ✅ **URLs públicas** y permanentes
- 🚀 **Alta velocidad** con CDN de GitHub
- 🆓 **Gratis** y sin límites
- 📁 **Organizado** en carpetas (`banners/`, `videos/`)

### **🖼️ Prioridad 2: Imgur**
- 🎯 **Muy confiable** para imágenes
- ⚡ **Rápido** y estable
- 📱 **Optimizado** para redes sociales

### **🌠 Prioridad 3: ImgBB**  
- 💾 **Alternativa rápida**
- 🔄 **Backup automático**
- 📊 **Panel de control** incluido

### **📰 Prioridad 4: Telegraph**
- 🎥 **Soporte para videos**
- 📄 **Imágenes pequeñas**
- 🔗 **URLs cortas** y estables

### **🏠 Prioridad 5: Local (Fallback)**
- 💾 **Almacenamiento local**
- 🌐 **Servidor web** incluido
- 🔒 **100% offline** si todo falla

---

## 🌐 **Configurar GitHub Storage**

### **📋 Paso a Paso:**

<details>
<summary><strong>Haz clic para expandir</strong></summary>

1. **🔑 Crear Token GitHub**
   - Ve a [GitHub Settings > Tokens](https://github.com/settings/tokens)
   - "Generate new token (classic)"
   - Selecciona permisos: `repo` + `workflow`

2. **⚙️ Configurar Variables**
   ```env
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   GITHUB_REPO=JDProgramer802/kirby-main-bot
   BASE_URL=https://raw.githubusercontent.com/JDProgramer802/kirby-main-bot/main
   ```

3. **🚀 Probar Sistema**
   ```bash
   /setbanner
   # El bot subirá automáticamente a tu repositorio
   ```

</details>

---

## 🛠️ **Desarrollo**

### **🔨 Crear Nuevo Plugin**

```javascript
// @nombre: micomando
// @alias: alias1, alias2  
// @categoria: admin
// @descripcion: Mi comando personalizado
// @reaccion: 🌸

export default async function(m, ctx) {
  await ctx.reply('✨ Mi nuevo comando funciona!');
}
```

### **📊 Estructura de Base de Datos**

| Tabla | Propósito | Registros |
|-------|----------|----------|
| `usuarios` | Perfiles, niveles, experiencia | 👥 |
| `grupos` | Configuración de grupos | 🏠 |
| `economia` | Balance, transacciones, tienda | 💰 |
| `subbots` | Gestión de sub-bots | 🤖 |
| `mascotas` | Sistema de gacha | 🎮 |
| `stickers_*` | Packs de stickers personalizados | 🎨 |

---

## 🌐 **Despliegue**

### **🏠 Local**
```bash
npm start
```

### **🐳 PM2 (Producción)**
```bash
npm install -g pm2
pm2 start index.js --name "kirby-bot"
pm2 logs kirby-bot
```

### **🐳 Docker**
```bash
docker build -t kirby-bot .
docker run -d --name kirby-bot --env-file .env kirby-bot
```

---

## 🤝 **Contribuir**

<div align="center">

**¡Únete a la comunidad Kirby!** 🌸

</div>

### **🔥 Cómo Contribuir**
1. **🍴 Fork** el repositorio
2. **🌿 Crear** rama: `git checkout -b feature/tu-nombre`
3. **💾 Commit** cambios: `git commit -m "Tu feature"`
4. **🔄 Push** y **PR**: `git push origin feature/tu-nombre`
5. **📧 Abrir** [Pull Request](https://github.com/JDProgramer802/kirby-main-bot/pulls)

### **🎯 Áreas de Contribución**
- 🐛 **Bug fixes** - Reporta y soluciona problemas
- ✨ **Nuevas features** - Agrega funcionalidades
- 📚 **Documentación** - Mejora guías y ejemplos
- 🎨 **UI/UX** - Mejora la experiencia del usuario
- 🧪 **Plugins** - Crea nuevos comandos

---

## 📄 **Licencia**

<div align="center">

![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)

</div>

Este proyecto es **código abierto** bajo la licencia MIT. 

**✅ Puedes usarlo, modificarlo y distribuirlo libremente**

---

## 🙏 **Agradecimientos**

<div align="center">

**Hecho con ❤️ por la comunidad**

</div>

### **🌟 Agradecimientos Especiales**
- **[@adiwajshing/baileys](https://github.com/adiwajshing/baileys)** - 📨 Librería principal de WhatsApp Web
- **[PostgreSQL](https://www.postgresql.org/)** - 🗄️ Base de datos robusta y confiable
- **[Comunidad Kirby](https://github.com/JDProgramer802/kirby-main-bot/graphs/contributors)** - 🌸 Todos los que hacen posible este proyecto

---

## 📞 **Soporte**

<div align="center">

**¿Necesitas ayuda?** Estamos para ti 🤝

</div>

### **📧 Canales de Soporte**
| Canal | Enlace | Descripción |
|-------|--------|-------------|
| � **Issues** | [Reportar problemas](https://github.com/JDProgramer802/kirby-main-bot/issues) | Reporta bugs y solicita features |
| 💬 **Discord** | [Servidor de comunidad](https://discord.gg/kirby) | Chat en tiempo real con otros usuarios |
| 📱 **WhatsApp** | [Canal oficial](https://whatsapp.com/channel/0029Vb7j8h3ADTOKGmHrfD1X) | Actualizaciones y anuncios |
| 📧 **Soporte técnico** | [Email de desarrollo](mailto:support@kirby-bot.com) | Ayuda profesional |

### **🚨 Reportar Issues**
Al reportar problemas, incluye:
- 📝 **Descripción clara** del problema
- 🔧 **Pasos para reproducir** el error
- 📸 **Versión del bot** y sistema operativo
- 🖼️ **Capturas de pantalla** si es relevante

---

<div align="center">

## 🌟 **Si este proyecto te ayuda...**

[![GitHub stars](https://img.shields.io/github/stars/JDProgramer802/kirby-main-bot?style=social)](https://github.com/JDProgramer802/kirby-main-bot/stargazers)

**No olvides darle ⭐ en GitHub!**

</div>

---

<div align="center">

**Hecho con 🌸 y ☕ por [Dream Kirby Developer](https://github.com/JDProgramer802)**

</div>
