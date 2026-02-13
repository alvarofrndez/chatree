# Guía de Inicio Rápido - AI Chat Linktree

## 🚀 Inicio Rápido en 5 Minutos

### Paso 1: Instalar Dependencias (1 min)

```bash
npm install
```

### Paso 2: Configurar Supabase Local (2 min)

```bash
# Instalar Supabase CLI (si no lo tienes)
npm install -g supabase

# Iniciar Supabase localmente
npx supabase start
```

**Importante**: Guarda las credenciales que te muestra, especialmente:
- `API URL`
- `anon key`
- `service_role key`

### Paso 3: Configurar Variables de Entorno (1 min)

```bash
# Copiar archivo de ejemplo
cp .env.local.example .env.local
```

Edita `.env.local` y pega tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aquí
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aquí
BETTER_AUTH_SECRET=cualquier_string_aleatorio_aquí
BETTER_AUTH_URL=http://localhost:3000
```

### Paso 4: Aplicar Migraciones (30 seg)

```bash
npx supabase db reset
```

### Paso 5: Iniciar la App (30 seg)

```bash
npm run dev
```

¡Listo! Abre http://localhost:3000 en tu navegador.

## 📝 Primeros Pasos

### Crear tu Primera Cuenta

1. Ve a http://localhost:3000
2. Click en "Get Started Free"
3. Completa el formulario de registro
4. Serás redirigido al dashboard

### Agregar tu Primer Chat de IA

1. En el dashboard, click en "+ Add Chat"
2. Completa los datos:
   - **Chat Title**: Ej. "How to build a REST API"
   - **Chat URL**: Pega el link de tu chat
   - **AI Platform**: Selecciona la plataforma (ChatGPT, Claude, etc.)
   - **Description**: (Opcional) Breve descripción
3. Click en "Add Chat"

### Agregar Enlaces Sociales

1. En el dashboard, sección "Social Links"
2. Click en "+ Add Link"
3. Completa:
   - **Platform**: Twitter, GitHub, LinkedIn, etc.
   - **URL**: URL de tu perfil
   - **Label**: (Opcional) Nombre personalizado
4. Click en "Add Link"

### Ver tu Perfil Público

1. En el dashboard, click en "View Profile"
2. Se abrirá tu página pública: `/u/tu_username`
3. ¡Comparte este link con el mundo!

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en modo producción
npm start

# Ver estado de Supabase
npx supabase status

# Detener Supabase
npx supabase stop

# Ver logs de Supabase
npx supabase logs
```

## 🎨 Personalizar Colores

Edita `styles/variables.scss` para cambiar los colores:

```scss
// Cambiar color primario
$color-primary: #ff3366; // Cambia este valor

// Cambiar color secundario
$color-secondary: #6366f1; // Cambia este valor

// Cambiar fondo
$color-background: #0a0a0f; // Cambia este valor
```

Guarda el archivo y los cambios se aplicarán automáticamente.

## 🌐 Plataformas de IA Soportadas

- **ChatGPT** - OpenAI
- **Claude** - Anthropic
- **Gemini** - Google
- **Copilot** - Microsoft
- **Perplexity** - Perplexity AI
- **Other** - Cualquier otra plataforma

## 💡 Tips

### Obtener Links de Chats

**ChatGPT**:
1. Abre tu chat en ChatGPT
2. Click en el botón de compartir
3. Copia el link

**Claude**:
1. Abre tu conversación
2. Click en los tres puntos (...)
3. Selecciona "Share"
4. Copia el link

**Gemini**:
1. Similar al proceso de ChatGPT/Claude
2. Busca el botón de compartir
3. Copia el link

### Organizar tus Enlaces

Los enlaces se muestran en el orden en que los agregas. Próximamente se agregará drag & drop para reordenar.

### Username Guidelines

- Solo letras, números, guiones y guiones bajos
- 3-30 caracteres
- Debe ser único
- Ejemplo: `juan_dev`, `maria-ai`, `carlos123`

## 🐛 Problemas Comunes

### "Cannot connect to Supabase"

**Solución**:
```bash
# Reiniciar Supabase
npx supabase stop
npx supabase start
```

### "Port 3000 already in use"

**Solución**:
```bash
# Usar otro puerto
PORT=3001 npm run dev
```

### "Module not found: sass"

**Solución**:
```bash
npm install sass
```

## 📚 Próximos Pasos

1. Personaliza tu perfil en el dashboard
2. Agrega tu foto de perfil
3. Escribe una biografía
4. Agrega todos tus chats favoritos
5. ¡Comparte tu link!

## 🎯 Ejemplos de Uso

### Para Creadores de Contenido
- Comparte tus mejores prompts y conversaciones
- Muestra cómo usas IA en tu trabajo
- Crea una colección de recursos de IA

### Para Desarrolladores
- Comparte soluciones de código generadas por IA
- Documenta problemas resueltos con IA
- Crea una biblioteca de referencias

### Para Educadores
- Comparte ejemplos educativos
- Crea recursos de aprendizaje
- Muestra casos de uso de IA en educación

### Para Investigadores
- Documenta experimentos con IA
- Comparte hallazgos interesantes
- Colabora con otros investigadores

## 🔐 Seguridad

- Nunca compartas chats con información sensible
- Revisa los chats antes de compartirlos
- Los enlaces son públicos una vez agregados
- Puedes desactivar enlaces en cualquier momento

## ❓ ¿Necesitas Ayuda?

- Lee el README.md completo
- Revisa la documentación de Supabase
- Abre un issue en GitHub
- Contacta al equipo de soporte

---

¡Disfruta compartiendo tus conversaciones de IA! 🚀
