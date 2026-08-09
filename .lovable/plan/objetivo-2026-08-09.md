## Objetivo
Mejorar la barra de filtros del widget **Campañas**: dos controles de organización relacionados entre sí + buscador, todo responsivo y con contraste correcto sobre cualquier color de fondo.

---

## 1. Barra de filtros (header del widget)

Fila única, alineada, con el mismo lenguaje visual del widget (pills redondeadas, borde sutil, fondo translúcido que se adapta al fondo del widget):

```text
[ Orden: Sin orden ▾ ]  [ Agrupar por: Estado ▾ ]  [ 🔍 Buscar marca… ]
```

En anchos pequeños la fila hace wrap: los dos selectores arriba, buscador debajo a ancho completo.

### Filtro 1 — Disposición (principal)
Menú desplegable con 3 opciones:
- **Sin orden** (actual): grid auto-fill que se adapta al ancho.
- **Por columnas**: las campañas se agrupan en columnas verticales tipo pizarra, una columna por grupo.
- **Por filas**: cada grupo es una fila horizontal con sus tarjetas en línea (scroll horizontal interno si no caben).

### Filtro 2 — Agrupar por (depende del primero)
Solo está activo cuando la disposición es *Por columnas* o *Por filas* (en "Sin orden" queda deshabilitado/atenuado). Opciones:
- **Estado de la colaboración**: Pendiente / Activa / Completada.
- **Cobro**: Cobrado / Por cobrar / Intercambio (sin monto).

Cada grupo lleva encabezado con nombre + contador de campañas, y aparece aunque esté vacío para que la estructura no salte al filtrar.

### Buscador
El input de lupa actual se compacta a la derecha de los selectores; sigue filtrando por marca y ahora también dentro de los grupos.

---

## 2. Responsividad
- **Columnas**: ancho mínimo por columna (~230px) y scroll horizontal cuando el widget es angosto; al agrandarlo las columnas se reparten el espacio.
- **Filas**: cada fila es un carril con scroll horizontal propio y tarjetas de ancho fijo, para que redimensionar el widget nunca rompa el layout.
- **Sin orden**: se mantiene el grid auto-fill actual.
- Se conserva el auto-ajuste de altura por IA (`useWidgetAutoFit`) recalculando con la nueva estructura.

---

## 3. Contraste con el color de fondo
- Los nuevos controles (pills, menús, encabezados de grupo, contadores) usan `isBoardDark`/`boardTextColor` — la lógica de luminancia que ya calcula el widget — en lugar de asumir dark mode.
- **Corrección incluida**: las tarjetas de campaña (`CampaignCard`) hoy usan `isDark` en vez del contraste real del fondo, así que sobre amarillo/rosa/verde el texto se ve mal. Pasan a usar `isBoardDark`.
- Los popovers de los selectores siguen el estilo de los menús existentes del widget.

---

## Detalle técnico
- Archivo: `src/components/nodes/CampaignsNode.tsx`.
- Nuevos campos en `CampaignsNodeData`: `layout?: "none" | "columns" | "rows"` y `groupBy?: "status" | "payment"`, persistidos con el nodo (default `none` / `status`).
- Agrupación derivada con `useMemo` desde `filtered`; sin cambios en el modelo `Campaign`.
- Los controles llevan `nodrag nopan` para no interferir con el arrastre del nodo.

---

## Fuera de alcance
- No se toca el editor de campaña ni el widget Ingresos.
- No se agregan filtros de exclusión (solo orden/agrupación + búsqueda), tal como se pidió.
