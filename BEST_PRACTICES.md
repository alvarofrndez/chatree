# Mejores Prácticas y Consejos - AI Chat Linktree

## 📐 Arquitectura y Estructura

### Organización de Componentes

**✅ BIEN:**
```javascript
// Componentes pequeños, enfocados y reutilizables
components/
  ├── Button.js          // Un componente, una responsabilidad
  ├── Input.js
  └── ChatLinkCard.js
```

**❌ MAL:**
```javascript
// Componentes grandes con múltiples responsabilidades
components/
  └── MegaComponent.js   // Hace muchas cosas a la vez
```

### Estilos SCSS

**✅ BIEN:**
```scss
// Usar variables y mixins
@import '../styles/variables.scss';
@import '../styles/mixins.scss';

.card {
  @include card;
  @include card-hover;
  color: $color-text-primary;
}
```

**❌ MAL:**
```scss
// Valores hardcodeados
.card {
  padding: 24px;
  color: #f8f9fa;
  border-radius: 16px;
}
```

## 🔒 Seguridad

### Validación de Datos

**Siempre valida en el cliente Y en el servidor:**

```javascript
// Cliente (app/signup/page.js)
const usernameRegex = /^[a-zA-Z0-9_-]+$/
if (!usernameRegex.test(formData.username)) {
  throw new Error('Invalid username format')
}

// Servidor (Supabase RLS + constraints)
CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$')
```

### Row Level Security (RLS)

**Siempre habilita RLS en las tablas:**

```sql
-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver perfiles públicos
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Política: Los usuarios solo pueden editar su propio perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Variables de Entorno

**✅ BIEN:**
```javascript
// Usar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**❌ MAL:**
```javascript
// Hardcodear credenciales
const supabaseUrl = 'https://mi-proyecto.supabase.co'
const supabaseKey = 'mi-clave-secreta-aqui'
```

## ⚡ Performance

### Optimización de Imágenes

```javascript
// Usar el componente Image de Next.js
import Image from 'next/image'

<Image
  src={profile.avatar_url}
  alt="Avatar"
  width={120}
  height={120}
  loading="lazy"
/>
```

### Carga Perezosa

```javascript
// Cargar componentes pesados solo cuando se necesitan
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loading />,
  ssr: false
})
```

### Memoización

```javascript
import { useMemo } from 'react'

function ExpensiveComponent({ data }) {
  const processedData = useMemo(() => {
    return heavyProcessing(data)
  }, [data])
  
  return <div>{processedData}</div>
}
```

## 🎨 UX/UI

### Estados de Carga

**Siempre muestra feedback al usuario:**

```javascript
const [loading, setLoading] = useState(false)

const handleSubmit = async () => {
  setLoading(true)
  try {
    await saveData()
    // Mostrar éxito
  } catch (error) {
    // Mostrar error
  } finally {
    setLoading(false)
  }
}
```

### Mensajes de Error Claros

**✅ BIEN:**
```javascript
setError('El nombre de usuario ya está en uso. Por favor, elige otro.')
```

**❌ MAL:**
```javascript
setError('Error 400')
```

### Accesibilidad

```javascript
// Usar labels semánticos
<label htmlFor="username">Username</label>
<input id="username" type="text" />

// Usar aria-labels
<button aria-label="Close modal" onClick={onClose}>✕</button>

// Navegación por teclado
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') onClose()
  }
  document.addEventListener('keydown', handleEscape)
  return () => document.removeEventListener('keydown', handleEscape)
}, [])
```

## 🗄️ Base de Datos

### Índices

**Agregar índices en columnas frecuentemente consultadas:**

```sql
-- Índice en username para búsquedas rápidas
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Índice compuesto para ordenamiento
CREATE INDEX idx_ai_chat_links_position 
  ON public.ai_chat_links(user_id, position);
```

### Migraciones

**Usa migraciones para cambios en la BD:**

```bash
# Crear nueva migración
npx supabase migration new add_new_column

# Aplicar migraciones
npx supabase db push
```

**Nunca modifiques directamente en producción**

## 🧪 Testing

### Tests Unitarios (Ejemplo con Jest)

```javascript
// Button.test.js
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './Button'

test('renders button with text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})

test('calls onClick when clicked', () => {
  const handleClick = jest.fn()
  render(<Button onClick={handleClick}>Click me</Button>)
  fireEvent.click(screen.getByText('Click me'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### Tests E2E (Ejemplo con Playwright)

```javascript
// e2e/auth.spec.js
import { test, expect } from '@playwright/test'

test('user can sign up', async ({ page }) => {
  await page.goto('http://localhost:3000/signup')
  await page.fill('[name="username"]', 'testuser')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/.*dashboard/)
})
```

## 📝 Código Limpio

### Nombres Descriptivos

**✅ BIEN:**
```javascript
const handleDeleteChatLink = async (chatLinkId) => {
  await deleteChatLink(chatLinkId)
}
```

**❌ MAL:**
```javascript
const handleDel = async (id) => {
  await del(id)
}
```

### Evitar Código Duplicado (DRY)

**✅ BIEN:**
```javascript
// Crear función reutilizable
const fetchUserData = async (userId) => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

// Usar en múltiples lugares
const profile = await fetchUserData(user.id)
```

**❌ MAL:**
```javascript
// Duplicar código en cada componente
const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
```

### Comentarios Útiles

**✅ BIEN:**
```javascript
// Increment view count atomically to avoid race conditions
await supabase.rpc('increment_chat_views', { chat_id: id })
```

**❌ MAL:**
```javascript
// Call function
await supabase.rpc('increment_chat_views', { chat_id: id })
```

## 🔄 Git y Control de Versiones

### Commits Descriptivos

**✅ BIEN:**
```bash
git commit -m "feat: add social links management in dashboard"
git commit -m "fix: resolve username validation bug in signup"
git commit -m "style: update button hover animations"
```

**❌ MAL:**
```bash
git commit -m "updates"
git commit -m "fix"
git commit -m "wip"
```

### Branches

```bash
# Feature branch
git checkout -b feature/add-profile-editing

# Bugfix branch
git checkout -b fix/chat-link-validation

# Hotfix branch
git checkout -b hotfix/critical-security-issue
```

## 🚀 Deployment

### Variables de Entorno

**Checklist antes de deployment:**

- [ ] Todas las env vars configuradas en Vercel/Netlify
- [ ] URLs de producción actualizadas
- [ ] OAuth callbacks configurados para producción
- [ ] Supabase project apunta a producción

### Build

```bash
# Siempre testear el build localmente antes de deploy
npm run build
npm run start
```

### Monitoring

```javascript
// Agregar logging para errores
try {
  await operation()
} catch (error) {
  console.error('Operation failed:', {
    error: error.message,
    stack: error.stack,
    user: user.id,
    timestamp: new Date().toISOString()
  })
  throw error
}
```

## 📊 Analytics y Métricas

### Rastrear Eventos Importantes

```javascript
// Ejemplo con Google Analytics
const trackChatView = (chatId, platform) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_chat', {
      chat_id: chatId,
      ai_platform: platform
    })
  }
}
```

## 🔧 Mantenimiento

### Actualizar Dependencias Regularmente

```bash
# Verificar dependencias desactualizadas
npm outdated

# Actualizar dependencias
npm update

# Para actualizaciones mayores (cuidado!)
npm install package@latest
```

### Revisar Logs

```bash
# Logs de Supabase
npx supabase logs

# Logs de Vercel
vercel logs
```

## 📚 Recursos Adicionales

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [SCSS Documentation](https://sass-lang.com/documentation)
- [React Best Practices](https://react.dev/learn)

---

Recuerda: **El código se lee más veces de las que se escribe. Escribe código para humanos, no para máquinas.**
