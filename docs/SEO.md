# SEO y Indexación - Chatree

## Configuración Actual de SEO

El proyecto Chatree tiene una base sólida de SEO implementada:

### ✅ Implementado
- **Metadata API** (`app/layout.js`): Títulos, descripciones, OpenGraph, Twitter Cards, robots
- **Sitemap dinámico** (`app/sitemap.js`): Rutas estáticas + perfiles + prompts con lastModified
- **Robots.txt** (`app/robots.js`): Control de rastreo con bloqueado de áreas privadas
- **Datos estructurados JSON-LD**: Home (Organization, WebSite, WebPage, SoftwareApplication, FAQPage), Perfiles (ProfilePage, Person, ItemList), Prompts (CreativeWork), Explore (CollectionPage)
- **Breadcrumbs estructurados**: Implementado site-wide mediante `generateBreadcrumbSchema` en `lib/utils.js`
- **Canonical URLs**: Todas las páginas dinámicas tienen canonical correcto

### 🔧 Configuración Importante
- **Imagen OG**: `/public/og-image.svg` (1200×630px)
- **Palabras clave globales**: Configuradas en `app/layout.js`
- **Fecha última modificación estática**: Usable via `NEXT_PUBLIC_SITE_LAST_MODIFIED` env var

## Mejoras Implementadas

### 1. Sitemap Expandido
- Prompts activos incluidos (`/prompt/[id]`) con `updated_at` como lastModified
- Límite de 45,000 URLs para evitar el límite de Google (50k)
- Cambio de frecuencia home de `weekly` a `daily`

### 2. Breadcrumbs Site-wide
- Utilidad reutilizable: `generateBreadcrumbSchema(baseUrl, items)` en `lib/utils.js`
- Implementado en: Home, Explore, Perfil, Prompt Detail

### 3. Open Graph Images
- Imagen estática SVG en `/public/og-image.svg`
- Referenciada en `app/layout.js` para todas las páginas

## Mejoras a Largo Plazo

### Monitorización de Errores de Rastreo
1. Configura Google Search Console:
   - Agrega tu sitio: `https://chatree.chat`
   - Verifica propiedad (DNS o archivo HTML)
   - Envía sitemap: `/sitemap.xml`

2. Revisa regularmente:
   - **Coverage**: Errores 404, páginas excluidas
   - **Performance**: Core Web Vitals (LCP, FID, CLS)
   - **Enhancements**: Datos estructurados válidos

### Sitemap de Imágenes
Para mejorar descubrimiento de imágenes (avatares, prompts), crear `app/sitemap-images.xml`:
```javascript
// app/sitemap-images.js
export default async function sitemapImages() {
  // Consultar perfiles con avatar_url y prompts con imágenes
  return [...];
}
```

### Renderizado Dinámico para Crawlers
Si notas problemas de indexación, considera:
- Usar ISR (Incremental Static Regeneration) para páginas dinámicas
- Implementar detección de user-agent para servir HTML estático a crawlers

## Variables de Entorno Relevantes

```env
NEXT_PUBLIC_SITE_URL=https://chatree.chat
NEXT_PUBLIC_APP_NAME=Chatree
NEXT_PUBLIC_SITE_LAST_MODIFIED=2024-01-01T00:00:00Z  # Opcional: fecha última modificación estática
```

## Verificación

Para verificar los cambios:
1. **Build**: `npm run build`
2. **Inspeccionar sitemap**: `npm run dev` → visitar `/sitemap.xml`
3. **Validar metadata**: Ver código fuente de página
4. **Google Rich Results**: https://search.google.com/test/rich-results
5. **Sitemap validator**: https://www.xml-sitemaps.com/validate-xml-sitemap.html

## Contacto
Para dudas sobre SEO, contactar al equipo de desarrollo.
