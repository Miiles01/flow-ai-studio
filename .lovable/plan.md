

# Dashboard de Gestión de Colaboraciones con Marcas

## Resumen
Transformar la página principal en un dashboard estilo ElevenLabs (sidebar izquierdo + contenido principal) donde los usuarios gestionen su perfil de creador/influencer y descubran programas de colaboración con marcas.

## Estructura de la UI (inspirada en la imagen)

```text
+------------------+------------------------------------------+
| SIDEBAR          | CONTENIDO PRINCIPAL                      |
|                  |                                          |
| Logo Miiles      | "Buenas tardes, [nombre]"                |
|                  |                                          |
| Inicio           | [Cards de categorías]                    |
| Programas        | Moda | Deportes | Tech | Belleza | ...   |
| Búsqueda IA      |                                          |
| Flujos           | Programas destacados                     |
|                  | - Nike Affiliate Program                 |
| ─────────        | - Gymshark Partners                      |
| Mi Perfil        | - ...                                    |
| Configuración    |                                          |
+------------------+------------------------------------------+
```

## Base de datos (migraciones)

### Tabla `brand_programs`
Almacena programas de colaboración/afiliados de marcas.
- `id` (uuid, PK)
- `name` (text) — nombre del programa
- `brand_name` (text) — marca
- `description` (text)
- `category` (text) — moda, deportes, tech, belleza, salud, etc.
- `commission_rate` (text) — ej: "10-20%"
- `program_url` (text) — enlace externo
- `logo_url` (text, nullable)
- `is_featured` (boolean, default false)
- `created_at`, `updated_at`
- RLS: lectura pública para autenticados

### Tabla `user_applications`
Registro de programas a los que el usuario aplica/guarda.
- `id` (uuid, PK)
- `user_id` (uuid, FK profiles)
- `program_id` (uuid, FK brand_programs)
- `status` (text: 'saved', 'applied', 'accepted', 'rejected')
- `created_at`
- RLS: usuarios solo ven/crean las suyas

### Ampliar `profiles`
Agregar campos: `instagram_handle`, `bio`, `niche` (text) para el perfil de creador.

## Componentes nuevos

1. **`DashboardLayout`** — Layout con sidebar + área principal. Sidebar con navegación (Inicio, Programas, Búsqueda IA, Flujos, Perfil).
2. **`Dashboard`** (página `/`) — Saludo personalizado, cards de categorías, programas destacados, aplicaciones recientes.
3. **`Programs`** (página `/programs`) — Lista filtrable de programas de marcas con búsqueda.
4. **`ProgramCard`** — Card individual de un programa con botón "Guardar"/"Aplicar".
5. **Actualizar `Profile`** — Agregar campos de Instagram, bio, nicho.

## Rutas actualizadas

- `/` → Dashboard (home)
- `/programs` → Explorar programas
- `/search` → Búsqueda IA (actual TestAI, integrado en layout)
- `/flows` → Editor de flujos (actual Index, movido)
- `/profile` → Perfil del creador

## Pasos de implementación

1. Crear migración: tablas `brand_programs`, `user_applications`, y columnas nuevas en `profiles`, con RLS
2. Insertar datos seed de programas de ejemplo (Nike, Gymshark, Sephora, etc.)
3. Crear `DashboardLayout` con sidebar responsive
4. Crear página `Dashboard` con saludo, categorías y destacados
5. Crear página `Programs` con listado y filtros
6. Mover el editor de flujos a `/flows`
7. Integrar búsqueda IA en `/search` dentro del layout
8. Actualizar `Profile` con campos de creador
9. Actualizar `App.tsx` con nuevas rutas

