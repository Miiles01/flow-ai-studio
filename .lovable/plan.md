# Plan: Tendencias (Noticias de negocios)

Una nueva sección de noticias/tendencias de negocios, visible para **todos los usuarios** (gratis, pro, negocios). Tendrá su propio "cerebro" interno (base de datos que se autolimpia) alimentado por **Claude** mediante una automatización externa que llama a un endpoint seguro.

## 1. Base de datos — nuevo cerebro de tendencias

Nueva tabla `trends` (separada del cerebro de prospectos):

```text
trends
├─ id            uuid
├─ title         text        (título de la noticia)
├─ summary       text        (descripción larga, scrolleable)
├─ media_url     text        (imagen/video vertical tipo teléfono)
├─ media_type    text        ('image' | 'video')
├─ thumbnail_url text        (miniatura para el story del carrusel)
├─ links         jsonb       (lista de { label, url } para botones/links externos)
├─ bullets       jsonb       (lista de strings para viñetas)
├─ category      text        (ej. "negocios")
├─ source        text        (fuente / "claude-agent")
├─ published_at  timestamptz
├─ expires_at    timestamptz (se autolimpia tras ~unas semanas)
├─ is_active     boolean
├─ created_at / updated_at
```

- **Lectura pública**: política RLS que permite a cualquier usuario autenticado leer tendencias activas y no expiradas (`is_active = true AND expires_at > now()`).
- **Escritura**: solo `service_role` (vía el endpoint de automatización). Ningún usuario puede insertar/editar desde el cliente.
- GRANTs: `SELECT` a `authenticated`; `ALL` a `service_role`.
- Autolimpieza: las consultas filtran por `expires_at > now()`, y un cron diario opcional borra las expiradas para mantener la tabla limpia.

## 2. Endpoint para Claude — `ingest-trends` (edge function)

Mismo patrón que `auto-ingest` (autenticado con `x-automation-key` = `AUTOMATION_SECRET`, que ya existe):

- Recibe `{ trends: [...] }` con título, resumen, media_url, links, bullets, etc.
- Deduplica por título.
- Asigna `expires_at` (por defecto +21 días) si no viene en el payload.
- Inserta con `service_role`.

Claude (vía tu automatización externa: Make/n8n/script con cron) llamará a este endpoint periódicamente para alimentar el cerebro. **Te entregaré la URL del endpoint y el formato JSON exacto** para que conectes a Claude. La `AUTOMATION_SECRET` ya está configurada.

## 3. Vista previa en Inicio — Stories de Instagram

En `Dashboard.tsx`, debajo de las tarjetas de Notificaciones/Proyectos:

- Título **"Tendencias"**.
- Carrusel horizontal scrolleable (mismo patrón de carrusel del proyecto: `overflow-x-auto snap-x scrollbar-hide` con bleed en mobile).
- Cada "story" = círculo/tarjeta vertical con anillo tipo Instagram + miniatura + título corto.
- Al hacer clic → abre el **popup de detalle** (componente compartido).
- Si no hay datos: muestra placeholders vacíos (skeletons tipo story) como pediste.

## 4. Popup de detalle (componente `TrendStoryViewer`)

Dialog grande con dos columnas:

- **Derecha**: media vertical tipo teléfono (video vertical autoplay o imagen vertical), formato 9:16.
- **Izquierda**: título + descripción scrolleable, con soporte de viñetas (bullets) y botones/links que abren enlaces externos en nueva pestaña.
- **Botones de navegación** (anterior / siguiente) para deslizar entre stories sin cerrar el popup, estilo visor de stories.
- En mobile se apila (media arriba, texto abajo).
- Sigue el sistema de diseño Miiles (dark/light, `rounded`, Poppins, botones `rounded-full`).

## 5. Página completa del dashboard — `/trends`

- Nueva ruta `/trends` en `App.tsx` (dentro de `DashboardRoute`).
- Nuevo ítem **"Tendencias"** en `mainNav` de `DashboardLayout.tsx`, **debajo de "Tableros"** (icono tipo `Newspaper`/`Sparkles`).
- La página muestra todas las tendencias activas en una grilla de cards; al hacer clic abre el mismo `TrendStoryViewer`.

## Detalles técnicos
- Hook `useTrends()` que consulta `trends` activas ordenadas por `published_at desc`.
- `TrendStoryViewer` reutilizado en Inicio y en `/trends`.
- Datos de media: Claude envía URLs externas (imagen/video). No requiere subir archivos a storage en esta fase.
- Sin lógica de pago/plan: acceso universal.

## Lo que necesito de ti (después de implementar)
- Confirmar la herramienta de automatización donde correrás a Claude (Make, n8n, script con cron, etc.) para darte la URL + JSON del endpoint `ingest-trends`.

¿Procedo a construirlo así?
