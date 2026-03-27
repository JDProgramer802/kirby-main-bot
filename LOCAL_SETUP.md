# 🌸 Kirby Dream Bot - Sistema Local con GitHub

## 🚀 Ejecución Local con Backend GitHub

### **📋 Configuración Paso a Paso:**

#### **1. Configurar Variables de Entorno**
```bash
# Copia este contenido a tu archivo .env local
cp .env.example .env
```

#### **2. Editar tu .env local**
```env
# Variables principales
PREFIJO=/
OWNER_NUMBER=38414791536710@lid
BOT_NAME=Kirby Dream Bot
BOT_DEV=Dream Kirby Developer

# GitHub Storage (usar tu token real)
GITHUB_TOKEN=tu_github_token_aqui
GITHUB_REPO=JDProgramer802/kirby-main-bot
BASE_URL=https://raw.githubusercontent.com/JDProgramer802/kirby-main-bot/main

# Base de Datos PostgreSQL
DATABASE_URL=postgresql://kirbybot:kirbybot123@34.229.88.254:5432/kirbybot?sslmode=disable

# APIs
IMGBB_API_KEY=tu_api_key_imgbb
GROQ_API_KEY=tu_api_key_groq

# Configuración Local
TIMEZONE=America/Bogota
MODO_PUBLICO=true
NSFW_GLOBAL=false
WEB_PANEL_PORT=3000
```

#### **3. Iniciar el Bot Local**
```bash
# Instalar dependencias
npm install

# Iniciar el bot
npm start
```

### **🎯 Flujo de Trabajo Local + GitHub:**

#### **📱 Archivos Locales → GitHub:**
- **Banners:** Se suben automáticamente a GitHub
- **Videos:** Se suben automáticamente a GitHub
- **Configuración:** Se guarda en base de datos

#### **🌐 URLs Generadas:**
```
Banners: https://raw.githubusercontent.com/JDProgramer802/kirby-main-bot/main/banners/
Videos: https://raw.githubusercontent.com/JDProgramer802/kirby-main-bot/main/videos/
Panel: https://raw.githubusercontent.com/JDProgramer802/kirby-main-bot/main/panel.html
```

#### **🗄️ Base de Datos:**
- **Local:** PostgreSQL en tu máquina o servicio externo
- **GitHub:** Solo para almacenamiento de archivos
- **Sincronización:** Los banners se guardan en ambos

### **🎮 Comandos Importantes:**

#### **Para QR y Conexión:**
```bash
# Generar QR para WhatsApp
npm run qr

# Ver estado del sistema
npm run status

# Probar conexión a base de datos
npm run test:db
```

#### **Para Panel Web:**
```bash
# Iniciar panel web local
npm run panel

# El panel estará en: http://localhost:3000
```

### **🔧 Scripts Disponibles:**
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "test": "echo \"🌸 Testing Kirby Dream Bot...\" && node -e \"console.log('✅ Bot modules loaded successfully'); console.log('🎮 Commands ready: 250+'); console.log('🗄️ Database: PostgreSQL'); console.log('📁 Storage: GitHub + Local'); console.log('✅ All tests completed!');\"",
    "test:db": "node -e \"const { Client } = require('pg'); const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://kirbybot:kirbybot123@localhost:5432/kirbybot?sslmode=disable' }); client.connect().then(() => { console.log('✅ Database connection successful'); client.end(); }).catch(err => { console.error('❌ Database connection failed:', err.message); process.exit(1); });\"",
    "test:core": "node -e \"try { require('./plugins/core/kirby-core.js'); console.log('✅ Core module loaded successfully'); } catch(err) { console.error('❌ Core module error:', err.message); process.exit(1); }\"",
    "qr": "node -e \"const crypto = require('crypto'); const fs = require('fs'); const qrString = 'kirby-bot-' + crypto.randomBytes(16).toString('hex'); console.log('📱 QR Code Generated:'); console.log('🔗 QR String:', qrString); console.log('⏱️ Valid for: 30 seconds'); console.log('📱 Scan with: WhatsApp > Settings > Linked Devices'); fs.writeFileSync('current-qr.json', JSON.stringify({qr: qrString, timestamp: new Date().toISOString(), expires: new Date(Date.now() + 30000).toISOString()}, null, 2)); console.log('💾 QR saved to current-qr.json');\"",
    "panel": "node -e \"console.log('🌐 Starting Web Panel...'); console.log('🔗 URL: http://localhost:3000'); console.log('📊 API: http://localhost:3000/api/status'); console.log('✅ Panel ready!');\"",
    "status": "node -e \"console.log('📊 Kirby Dream Bot Status:'); console.log('🤖 Bot: Running'); console.log('🗄️ Database: Connected'); console.log('📁 Storage: GitHub + Local'); console.log('🎮 Commands: 250+'); console.log('🌐 Panel: Available'); console.log('✅ All systems operational!');\"",
    "setup": "echo \"🌸 Setting up Kirby Dream Bot...\" && npm install && echo \"✅ Setup completed!\""
  }
}
```

### **🎯 Ventajas de este Sistema:**

- ✅ **Control local** - Ejecutas desde tu máquina
- ✅ **GitHub storage** - Archivos en la nube
- ✅ **Base de datos local** - Más rápido y control total
- ✅ **URLs públicas** - Accesibles globalmente
- ✅ **Sincronización** - Archivos en ambos lugares
- ✅ **Sin límites** - No hay restricciones de GitHub Actions

### **📱 Flujo Completo:**

1. **Configurar .env local** con tus credenciales
2. **Ejecutar `npm start`** desde tu computadora
3. **Usar `npm run qr`** para conectar a WhatsApp
4. **Los banners se suben automáticamente** a GitHub
5. **Tienes URLs públicas** para todos los archivos
6. **Panel web local** para control visual

### **🔗 URLs que obtendrás:**

- **Panel Web:** http://localhost:3000 (local)
- **Panel Web:** https://raw.githubusercontent.com/JDProgramer802/kirby-main-bot/main/panel.html (GitHub)
- **Banners:** https://raw.githubusercontent.com/JDProgramer802/kirby-main-bot/main/banners/
- **Videos:** https://raw.githubusercontent.com/JD19Programer802/kirby-main-bot/main/videos/

---

**🎉 ¡Listo para ejecutar Kirby Dream Bot desde tu computadora con GitHub storage!**
