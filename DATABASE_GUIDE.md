# 🗄️ Configuración de Base de Datos - Kirby Dream Bot

## 📋 Guía Rápida de Configuración

### **🔑 Paso 1: Obtener URL de Supabase**

1. **Ve a [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Inicia sesión** o crea una cuenta
3. **Crea un nuevo proyecto** o usa uno existente
4. **Ve a Settings > Database** en tu proyecto
5. **Copia la **Connection String**:
   ```
   postgresql://postgres:[TU-PASSWORD]@[HOST]:5432/postgres
   ```

### **⚙️ Paso 2: Configurar Variables**

Reemplaza en tu `.env`:

```env
# ❌ URL INCORRECTA (no usar esta):
# DATABASE_URL=postgresql://postgres:tu_password@host:5432/tu_db

# ✅ URL CORRECTA (usar esta):
DATABASE_URL=postgresql://postgres:[TU-PASSWORD]@[HOST]:5432/postgres
```

### **🔍 Paso 3: Verificar Configuración**

Ejecuta este comando para probar:
```bash
npm run db:test
```

## 🚨 **Errores Comunes y Soluciones**

| Error | Causa | Solución |
|--------|--------|----------|
| **Tenant or user not found** | URL mal formateada | Verifica que tu DATABASE_URL tenga el formato correcto de Supabase |
| **Connection timed out** | Firewall o red | Verifica conexión a internet, intenta con otro puerto |
| **Authentication failed** | Credenciales incorrectas | Revisa usuario y contraseña de la base de datos |

## 📞 **Soporte si tienes problemas**

- **📧 Issues**: [Reportar problemas](https://github.com/JDProgramer802/kirby-main-bot/issues)
- **💬 Discord**: [Comunidad de soporte](https://discord.gg/kirby)
- **📱 WhatsApp**: [Canal oficial](https://whatsapp.com/channel/0029Vb7j8h3ADTOKGmHrfD1X)

---

**🎯 Una vez configurado, ejecuta: `npm start`**
