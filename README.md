# AI Chat Linktree 🤖🔗

Una aplicación tipo Linktree diseñada específicamente para compartir y descubrir conversaciones de IA desde ChatGPT, Claude, Gemini, Copilot, Perplexity y más.

## 🌟 Características

- **Multi-plataforma**: Soporte para ChatGPT, Claude, Gemini, Copilot, Perplexity y otras plataformas de IA
- **Perfiles personalizados**: Cada usuario obtiene su propia URL personalizada (`/u/username`)
- **Enlaces sociales**: Agrega tus redes sociales al estilo Linktree
- **Seguimiento de vistas**: Rastrea cuántas personas ven tus conversaciones de IA
- **Diseño moderno**: Interfaz hermosa con animaciones y efectos visuales
- **Autenticación completa**: Sistema de usuarios con email/password y OAuth (Google)
- **Responsive**: Funciona perfectamente en móvil, tablet y desktop

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router, sin TypeScript)
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Estilos**: SCSS Modules (sin Tailwind ni Bootstrap)
- **Animaciones**: CSS + Framer Motion

## 📋 Requisitos Previos

- Node.js 18.17 o superior
- npm o yarn
- Cuenta de Supabase (gratis en https://supabase.com)
- (Opcional) Cuenta de Google Cloud para OAuth

## 🚀 Instalación

### 1. Clonar e instalar dependencias

```bash
# Instalar dependencias
npm install
```

### 2. Configurar Supabase

#### Opción A: Usando Supabase CLI (Recomendado para desarrollo local)

```bash
# Instalar Supabase CLI globalmente
npm install -g supabase

# Iniciar Supabase localmente
npx supabase init
npx supabase start

# Esto iniciará una instancia local de Supabase
# Guarda las URLs y keys que te proporciona
```

#### Opción B: Usando Supabase Cloud

1. Ve a https://supabase.com y crea un nuevo proyecto
2. Una vez creado, ve a `Project Settings > API`
3. Copia la `Project URL` y `anon/public key`

#### Aplicar migraciones

```bash
# Si usas Supabase local
npx supabase db push

# Si usas Supabase cloud
# Ve a SQL Editor en el dashboard y ejecuta el contenido de:
# supabase/migrations/20240101000000_initial_schema.sql
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Copiar el archivo de ejemplo
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url_aquí
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key_aquí
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aquí

# Better Auth (genera un string aleatorio)
BETTER_AUTH_SECRET=genera_un_string_aleatorio_seguro_aquí
BETTER_AUTH_URL=http://localhost:3000

# OAuth (opcional)
GITHUB_CLIENT_ID=tu_github_client_id
GITHUB_CLIENT_SECRET=tu_github_client_secret
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

### 4. Configurar OAuth de Google (Opcional)

1. Ve a https://console.cloud.google.com
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a "APIs & Services" > "Credentials"
4. Crea "OAuth 2.0 Client ID"
5. Agrega `http://localhost:3000/api/auth/callback` a las URIs de redirección autorizadas
6. Copia el Client ID y Client Secret a tu `.env.local`

En Supabase:
1. Ve a `Authentication > Providers > Google`
2. Activa Google
3. Pega tu Client ID y Client Secret
4. Guarda los cambios

### 5. Iniciar la aplicación

```bash
# Modo desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:3000
```

## 📁 Estructura del Proyecto

```
ai-chat-linktree/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/callback/        # OAuth callback
│   │   └── chats/[id]/view/      # Incrementar vistas
│   ├── dashboard/                # Panel de usuario
│   ├── login/                    # Página de login
│   ├── signup/                   # Página de registro
│   ├── u/[username]/             # Perfiles públicos
│   ├── layout.js                 # Layout principal
│   └── page.js                   # Página de inicio
├── components/                   # Componentes React
│   ├── Button.js                 # Botón reutilizable
│   ├── Button.module.scss
│   ├── ChatLinkCard.js           # Tarjeta de chat de IA
│   ├── ChatLinkCard.module.scss
│   ├── Input.js                  # Input reutilizable
│   ├── Input.module.scss
│   ├── SocialLinkCard.js         # Tarjeta de enlace social
│   └── SocialLinkCard.module.scss
├── lib/                          # Utilidades
│   └── supabase/                 # Clientes de Supabase
│       ├── client.js             # Cliente del navegador
│       ├── server.js             # Cliente del servidor
│       └── middleware.js         # Middleware de auth
├── styles/                       # Estilos SCSS
│   ├── variables.scss            # Variables (colores, fuentes, etc.)
│   ├── mixins.scss               # Mixins reutilizables
│   └── global.scss               # Estilos globales
├── supabase/                     # Configuración de Supabase
│   ├── migrations/               # Migraciones SQL
│   └── config.toml               # Configuración local
├── middleware.js                 # Middleware de Next.js
├── next.config.js                # Configuración de Next.js
├── package.json                  # Dependencias
└── README.md                     # Este archivo
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales

#### `profiles`
- `id` (UUID, PK): ID del usuario (vinculado a auth.users)
- `username` (TEXT, UNIQUE): Nombre de usuario único
- `full_name` (TEXT): Nombre completo
- `bio` (TEXT): Biografía
- `avatar_url` (TEXT): URL del avatar
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### `ai_chat_links`
- `id` (UUID, PK): ID del enlace
- `user_id` (UUID, FK): ID del usuario
- `title` (TEXT): Título del chat
- `url` (TEXT): URL del chat
- `ai_platform` (TEXT): Plataforma de IA (chatgpt, claude, gemini, etc.)
- `description` (TEXT): Descripción opcional
- `position` (INTEGER): Orden de visualización
- `is_active` (BOOLEAN): Si está activo
- `views_count` (INTEGER): Contador de vistas
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### `social_links`
- `id` (UUID, PK): ID del enlace
- `user_id` (UUID, FK): ID del usuario
- `platform` (TEXT): Plataforma social
- `url` (TEXT): URL del perfil
- `label` (TEXT): Etiqueta personalizada
- `position` (INTEGER): Orden de visualización
- `is_active` (BOOLEAN): Si está activo
- `created_at` (TIMESTAMPTZ)

## 🎨 Personalización de Estilos

Todos los estilos están centralizados en SCSS con variables y mixins:

### Variables (`styles/variables.scss`)
```scss
$color-primary: #ff3366;
$color-secondary: #6366f1;
$font-display: 'Space Grotesk', sans-serif;
// ... más variables
```

### Mixins (`styles/mixins.scss`)
```scss
@include flex-center;
@include button-variant($color-primary);
@include card;
// ... más mixins
```

Para cambiar el diseño, simplemente modifica las variables en `variables.scss`.

## 🔒 Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Los usuarios solo pueden editar su propio contenido
- Validación de datos en cliente y servidor
- Protección contra SQL injection mediante Supabase
- HTTPS en producción (configurar en Vercel/Netlify)

## 🚢 Deployment

### Vercel (Recomendado)

1. Push tu código a GitHub
2. Importa el proyecto en Vercel
3. Configura las variables de entorno
4. Deploy automático

### Netlify

1. Push tu código a GitHub
2. Conecta el repositorio en Netlify
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Configura las variables de entorno

### Variables de entorno en producción

Asegúrate de configurar todas las variables de `.env.local` en tu plataforma de deployment.

## 📝 Uso

### Para Usuarios

1. **Registro**: Crea una cuenta con email/password o Google
2. **Dashboard**: Agrega enlaces a tus chats de IA y redes sociales
3. **Comparte**: Comparte tu URL personalizada (`/u/tu_username`)
4. **Rastrea**: Ve cuántas personas visitan tus enlaces

### Para Desarrolladores

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm run start

# Linting
npm run lint

# Supabase CLI
npm run supabase
```

## 🐛 Troubleshooting

### Error: "Invalid login credentials"
- Verifica que las credenciales sean correctas
- Asegúrate de que Supabase Auth esté configurado correctamente

### Error: "Username already exists"
- El username ya está en uso
- Elige un username diferente

### Los estilos no se cargan
- Verifica que `sass` esté instalado: `npm install sass`
- Reinicia el servidor de desarrollo

### OAuth no funciona
- Verifica las URLs de callback en Google Cloud Console
- Asegúrate de que las credenciales estén en `.env.local`
- Verifica la configuración en Supabase Auth

## 🤝 Contribuir

Las contribuciones son bienvenidas! Si encuentras un bug o tienes una sugerencia:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🙏 Créditos

- Next.js por el framework
- Supabase por la infraestructura
- Vercel por el hosting
- Google Fonts por las fuentes

## 📞 Soporte

¿Necesitas ayuda? Abre un issue en GitHub o contacta al equipo de desarrollo.

---

Hecho con ❤️ usando Next.js y Supabase
