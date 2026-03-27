# 🛠️ SOLUCIÓN RÁPIDA - Problema de DNS

## 🔍 **Problema Identificado**
El error `getaddrinfo ENOTFOUND aws-0-us-west-2.pooler.supabase.co` indica que tu sistema no puede resolver el hostname de Supabase.

## ⚡ **Solución Inmediata**

### **Opción 1: Usar IP Directa (Recomendado)**
Reemplaza en tu `.env`:
```env
DATABASE_URL=postgresql://postgres:oLmJw8Yu$dv$kkvG@34.229.88.254:5432/postgres
```

### **Opción 2: Configurar DNS Local (Avanzado)**
1. **Abre hosts de Windows:**
   ```bash
   notepad C:\Windows\System32\drivers\etc\hosts
   ```

2. **Agrega esta línea al final:**
   ```
   34.229.88.254 db.lpjgbmxopvqcwpmdjhgw.supabase.co
   ```

3. **Guarda y reinicia el bot**

### **🔧 Verificación**
Ejecuta en tu terminal:
```bash
ping 34.229.88.254
```

Deberías ver respuesta como:
```
PING 34.229.88.254 (34.229.88.254): 56 data bytes
```

## 📋 **Pasos para Configurar IP Directa**

1. **Editar .env:**
   ```bash
   nano .env
   ```

2. **Reemplazar DATABASE_URL:**
   - Busca la línea que empieza con `DATABASE_URL=`
   - Reemplaza el hostname con la IP: `34.229.88.254`

3. **Guardar y salir:**
   - `Ctrl + O`, luego `Enter`, `Y`
   - Reinicia el bot: `npm start`

## 🚨 **Si Funciona**

Una vez configurada la IP directa, el bot debería iniciar sin errores de conexión.

## 📞 **Soporte Adicional**

Si el problema persiste:
- **📧 Issues**: [Reportar problema](https://github.com/JDProgramer802/kirby-main-bot/issues)
- **💬 Discord**: [Comunidad de soporte](https://discord.gg/kirby)

---

**✅ Con IP directa, tu bot debería funcionar inmediatamente!**
