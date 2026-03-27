# 🌸 Kirby Dream Bot - WhatsApp Bot

Un bot de WhatsApp multifuncional con sistema de subbots, economía, y mucho más.

## ✨ Características Principales

- 🤖 **Sistema de Sub-Bots** - Crea y gestiona tus propios bots
- 🌸 **Banners Dinámicos** - Soporte para banners de bienvenida/despedida con almacenamiento en GitHub
- 💰 **Sistema de Economía** - Coins, tienda, y recompensas
- 🎮 **Gacha System** - Colecciona personajes y waifus
- 📱 **Admin Completo** - Control total de grupos y usuarios
- 🔞 **Contenido NSFW** - Módulo adulto opcional
- 🎨 **Stickers Personalizados** - Crea y gestiona packs de stickers
- 📊 **Sistema de Niveles** - Experiencia y recompensas
- 🌐 **Multi-API Storage** - GitHub, Imgur, ImgBB, Telegraph

## 🚀 Instalación

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/JDProgramer802/kirby-main-bot.git
   cd kirby-main-bot
   ```

2. **Instala dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   ```bash
   cp .env.example .env
   # Edita .env con tus credenciales
   ```

## ⚙️ Configuración

### Variables de Entorno Principales

```env
# Configuración del Bot
PREFIJO=/
OWNER_NUMBER=38414791536710@lid
BOT_NAME=Kirby Dream Bot
BOT_DEV=Dream Kirby Developer

# Base de Datos PostgreSQL
DATABASE_URL=postgresql://usuario:password@host:5432/database

# APIs Externas
IMGBB_API_KEY=tu_api_key_imgbb
GROQ_API_KEY=tu_api_key_groq

# Almacenamiento GitHub (Opcional)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=JDProgramer802/kirby-main-bot
BASE_URL=https://raw.githubusercontent.com/JDProgramer802/kirby-main-bot/main
```

### Obtener Tokens:

- **GitHub Token:** Ve a [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
- **ImgBB API Key:** Regístrate en [ImgBB](https://imgbb.com/)
- **Groq API Key:** Regístrate en [Groq](https://groq.com/)

## 📁 Estructura del Proyecto

```
kirby-pro/
├── src/
│   ├── lib/           # Librerías principales
│   │   ├── handler.js      # Manejador de mensajes
│   │   ├── database.js     # Conexión a PostgreSQL
│   │   ├── config.js       # Configuración
│   │   ├── github-storage.js # Almacenamiento GitHub
│   │   └── upload-apis.js  # APIs externas
├── plugins/             # Sistema de plugins modular
│   ├── admin/         # Comandos de administración
│   ├── subbots/       # Gestión de sub-bots
│   ├── anime/         # Reacciones de anime
│   ├── economia/       # Sistema de economía
│   ├── gacha/         # Sistema de gacha
│   ├── nsfw/          # Contenido adulto
│   ├── stickers/      # Sistema de stickers
│   └── utilidad/      # Utilidades varias
├── scripts/            # Scripts de mantenimiento
├── public/             # Archivos públicos (banners, videos)
└── tmp/               # Archivos temporales
```

## 🎮 Comandos Principales

### Administración
- `/menu` - Menú principal del bot
- `/setbanner` - Cambiar banner del menú
- `/setbannerwel` - Banner de bienvenida
- `/setbannerbye` - Banner de despedida
- `/kick @usuario` - Expulsar usuario
- `/promote @usuario` - Dar admin
- `/welcome` - Activar bienvenida
- `/goodbye` - Activar despedida

### Sub-Bots
- `/qr` - Generar QR para sub-bot
- `/code` - Generar código de vinculación
- `/setname` - Cambiar nombre del sub-bot
- `/setpfp` - Cambiar foto de perfil
- `/logout` - Desconectar sub-bot

### Economía
- `/balance` - Ver tu balance
- `/work` - Trabajar y ganar coins
- `/daily` - Recompensa diaria
- `/shop` - Tienda de items
- `/buy @item` - Comprar item

### Utilidades
- `/sticker` - Crear sticker de imagen
- `/ping` - Verificar velocidad del bot
- `/invite` - Link de invitación
- `/toimage` - Convertir sticker a imagen

## 🔧 Sistema de Almacenamiento

El bot ahora soporta múltiples métodos de almacenamiento para banners:

1. **GitHub (Principal)** - Archivos subidos a tu repositorio
2. **Imgur** - Servicio de imágenes confiable
3. **ImgBB** - Alternativa rápida
4. **Telegraph** - Para videos y pequeñas imágenes
5. **Local** - Fallback automático

### Configurar GitHub Storage:

1. Crea un Personal Access Token en GitHub
2. Agrega `GITHUB_TOKEN` a tu .env
3. Los banners se subirán automáticamente a `banners/` en tu repo
4. URLs generadas: `https://raw.githubusercontent.com/user/repo/main/banners/archivo.png`

## 🛠️ Desarrollo

### Agregar Nuevo Plugin:

1. Crea archivo en `plugins/categoria/nombre.js`
2. Agrega metadatos al inicio:
   ```javascript
   // @nombre: micomando
   // @alias: alias1, alias2
   // @categoria: admin
   // @descripcion: Descripción del comando
   // @reaccion: 🌸
   ```
3. Exporta función por defecto:
   ```javascript
   export default async function(m, ctx) {
     // Tu lógica aquí
     await ctx.reply('Hola mundo');
   }
   ```

### Estructura de Base de Datos:

El bot usa PostgreSQL con las siguientes tablas principales:

- `usuarios` - Datos de usuarios y niveles
- `grupos` - Configuración de grupos
- `economia` - Balance y transacciones
- `subbots` - Gestión de sub-bots
- `mascotas` - Sistema de gacha
- `stickers_*` - Packs de stickers

## 🌐 Despliegue

### Opción 1: Local
```bash
npm start
```

### Opción 2: PM2 (Recomendado)
```bash
npm install -g pm2
pm2 start index.js --name "kirby-bot"
pm2 logs kirby-bot
```

### Opción 3: Docker
```bash
docker build -t kirby-bot .
docker run -d --name kirby-bot --env-file .env kirby-bot
```

## 🤝 Contribuir

1. **Fork** el repositorio
2. **Crea** una rama para tu feature
3. **Haz commit** de tus cambios
4. **Abre** un Pull Request

## 📄 Licencia

Este proyecto es de código abierto bajo licencia MIT. Siéntete libre de usarlo, modificarlo y distribuirlo.

## 🙏 Agradecimientos

- **Baileys** - Librería principal para WhatsApp Web
- **PostgreSQL** - Base de datos robusta
- **Comunidad** - A todos los que contribuyen y usan el bot

## 📞 Soporte

Si encuentras bugs o necesitas ayuda:
- 📧 **Issues:** [Reportar problemas](https://github.com/JDProgramer802/kirby-main-bot/issues)
- 💬 **Discord:** Comunidad de soporte
- 📱 **WhatsApp:** Canal oficial de actualizaciones

---

**⭐ Si te gusta el proyecto, no olvides darle estrella en GitHub!**
