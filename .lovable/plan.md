

## Plan: Rediseñar Perfil y mover "Cerrar sesión"

### Cambios

**1. Sidebar (`DashboardLayout.tsx`)**
- Eliminar el botón "Cerrar sesión" del sidebar
- Mantener solo la tarjeta de usuario que navega a `/profile`

**2. Migración de base de datos**
- Agregar columna `portfolio_url` (text, nullable) a la tabla `profiles`
- Renombrar conceptualmente "avatar_url" a usarse internamente para avatar, y el campo visible será "Portafolio URL"

**3. Rediseñar Profile.tsx completamente**
- **Header**: Avatar con iniciales, nombre, email, nicho como badge
- **Secciones organizadas con cards**:
  - **Información personal**: Nombre, Bio, Nicho, Teléfono
  - **Redes sociales**: Instagram, TikTok, Twitter/X, YouTube (todos ya existen en la DB)
  - **Links**: URL de portafolio (nuevo campo), avatar URL se mantiene interno
- **Botón "Cerrar sesión"** al final de la página con estilo destructivo
- Usar separadores y cards para mejor estructura visual
- Cargar y guardar todos los campos existentes (`phone`, `twitter_handle`, `youtube_handle`, `tiktok_handle`) que actualmente no se usan en el form

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `supabase/migrations/...` | Agregar `portfolio_url` a profiles |
| `src/pages/Profile.tsx` | Rediseño completo con secciones, más campos, cerrar sesión |
| `src/components/DashboardLayout.tsx` | Eliminar botón "Cerrar sesión" |

### Detalle técnico
- La tabla `profiles` ya tiene: `instagram_handle`, `tiktok_handle`, `twitter_handle`, `youtube_handle`, `phone` -- solo falta `portfolio_url`
- Se eliminan los casts `as any` del Profile aprovechando que los tipos ya reconocen estos campos
- El campo "URL del avatar" se reemplaza visualmente por "URL de portafolio" (nuevo campo `portfolio_url`)

