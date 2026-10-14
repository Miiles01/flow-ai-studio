# Nueva sección "Estudio"

## Qué vas a ver
- **Inicio (panel):** debajo de Descubrimientos, una sección "Estudio" con subtítulo "Crea una mejor presentación — plantillas y elementos para tu portafolio o embudo de ventas" y un carrusel de plantillas (miniatura + nombre + tipo).
- **Menú lateral:** nueva opción "Estudio" que lleva a la página `/studio`.
- **Página Estudio:** cuadrícula con todas las plantillas y filtros pill (Todas / Portafolios / Páginas web).
- **Detalle de plantilla** (`/studio/:slug`): barra tipo navegador arriba (botón volver, nombre de la plantilla), vista previa en vivo de la página dentro de un marco, y botones **Copiar** (copia el HTML) y **Descargar** (baja un ZIP con `index.html` + un `README.md` corto con instrucciones para que una IA de vibe coding lo entienda).
- **Panel de administrador:** nueva pestaña "Estudio" para subir plantillas: nombre, tipo (portafolio / página web), descripción, miniatura (imagen) y el HTML (pegar o subir archivo .html). Se puede editar, publicar/ocultar y borrar.
- **Plantilla demo:** "Portafolio UGC Demo", una página sencilla de ejemplo para probar todo el flujo.

## Detalles técnicos
- Tabla `studio_templates` (id, slug único, title, kind `portfolio|website`, description, thumbnail_url, html, is_published, sort_order, timestamps). RLS: usuarios autenticados leen solo `is_published = true`; escritura solo vía service role.
- Bucket público `studio-thumbnails` para miniaturas.
- Edge function `admin-studio-templates` con el mismo token admin de las otras pestañas (list / upsert / delete / upload thumbnail).
- Vista previa con `<iframe srcDoc sandbox="allow-scripts">` (sin acceso al sitio).
- ZIP en el navegador con `jszip` (se instala) y descarga por blob.
- Componentes: `StudioPreview` (sección en Dashboard, mismo estilo que Descubrimientos), `pages/Studio.tsx`, `pages/StudioTemplate.tsx`, `components/admin/StudioTab.tsx`; rutas dentro de `DashboardRoute`; dark mode con las reglas del proyecto.
- Revisar estado de GitHub antes de editar.
