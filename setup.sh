#!/bin/bash

# AI Chat Linktree - Setup Script
# Este script automatiza la configuración inicial del proyecto

echo "🚀 AI Chat Linktree - Configuración Automática"
echo "================================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "Por favor, instala Node.js desde https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v) detectado${NC}"
echo ""

# Instalar dependencias
echo "📚 Instalando dependencias..."
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencias instaladas correctamente${NC}"
else
    echo -e "${RED}❌ Error instalando dependencias${NC}"
    exit 1
fi
echo ""

# Verificar Supabase CLI
echo "🔧 Verificando Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI no está instalado${NC}"
    echo "¿Deseas instalar Supabase CLI? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        npm install -g supabase
        echo -e "${GREEN}✅ Supabase CLI instalado${NC}"
    else
        echo -e "${YELLOW}⚠️  Saltando instalación de Supabase CLI${NC}"
        echo "Podrás instalarlo más tarde con: npm install -g supabase"
    fi
else
    echo -e "${GREEN}✅ Supabase CLI detectado${NC}"
fi
echo ""

# Crear .env.local si no existe
if [ ! -f .env.local ]; then
    echo "📝 Creando archivo .env.local..."
    cp .env.local.example .env.local
    echo -e "${GREEN}✅ Archivo .env.local creado${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edita .env.local con tus credenciales de Supabase${NC}"
else
    echo -e "${YELLOW}⚠️  El archivo .env.local ya existe${NC}"
fi
echo ""

# Preguntar si desea iniciar Supabase local
if command -v supabase &> /dev/null; then
    echo "🐘 ¿Deseas iniciar Supabase localmente? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Iniciando Supabase..."
        supabase start
        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✅ Supabase iniciado correctamente${NC}"
            echo ""
            echo -e "${YELLOW}📋 IMPORTANTE: Guarda las credenciales mostradas arriba${NC}"
            echo "Cópialas en tu archivo .env.local"
            echo ""
        else
            echo -e "${RED}❌ Error iniciando Supabase${NC}"
        fi
    fi
fi

# Resumen final
echo ""
echo "================================================"
echo -e "${GREEN}✨ ¡Configuración completada!${NC}"
echo "================================================"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1. Edita .env.local con tus credenciales de Supabase"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "2. Si usas Supabase local:"
echo "   npx supabase start"
echo ""
echo "3. Inicia la aplicación:"
echo "   npm run dev"
echo ""
echo "4. Abre http://localhost:3000 en tu navegador"
echo ""
echo "📚 Para más información, consulta:"
echo "   - README.md - Documentación completa"
echo "   - QUICKSTART.md - Guía de inicio rápido"
echo ""
echo -e "${GREEN}¡Disfruta construyendo con AI Chat Linktree! 🚀${NC}"
echo ""
