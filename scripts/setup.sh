#!/bin/bash

echo "🌸 Configurando Kirby Dream Bot..."

# Verificar si existe .env
if [ ! -f ".env" ]; then
    echo "⚠️  No se encontró .env, creando desde .env.example..."
    cp .env.example .env
    echo "📝 Por favor edita .env con tus credenciales:"
    echo "   • OWNER_NUMBER: Tu número de WhatsApp con @lid"
    echo "   • GITHUB_TOKEN: Tu Personal Access Token de GitHub"
    echo "   • DATABASE_URL: Tu URL de PostgreSQL"
    echo ""
    echo "🔗 Guía para obtener GitHub Token:"
    echo "   https://github.com/settings/tokens"
    echo ""
    echo "✅ Una vez configurado, ejecuta: npm start"
else
    echo "✅ .env encontrado"
    echo "🚀 Iniciando bot..."
fi
