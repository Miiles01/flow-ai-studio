
# Plan: Widgets en el canvas + primer widget "Pizarra"

## Objetivo
Añadir un nuevo sistema de "Widgets" (elementos más elaborados que las formas), accesible desde un botón **Widgets** dentro del `AIPromptBar` (junto a "Apps"). El primer widget será una **Pizarra** tipo kanban (columnas con cards arrastrables). Reutiliza toda la lógica ya existente de nodos (drag, resize, selección, colores).

## 1. Botón "Widgets" en el input

**Archivo:** `src/components/AIPromptBar.tsx`
- Junto a `<AppsMenu />` (línea 196), añadir un botón blanco "Widgets" con ícono `LayoutTemplate` (lucide) del mismo tamaño/estilo que Apps pero con fondo blanco y texto negro para diferenciarlo.
- Al hacer clic abre un pop-up centrado (ver §2). Se cierra al hacer clic fuera o con `Esc`.

## 2. Pop-up de Widgets

**Nuevo archivo:** `src/components/widgets/WidgetsPicker.tsx`
- Renderizado vía portal (`createPortal` a `document.body`), posición `fixed`, centrado horizontalmente y con `top: ~15vh` (un poco arriba del centro).
- **Sin overlay** — el resto de la pantalla sigue visible/interactivo salvo por captura de clics fuera para cerrarse.
- Cuadrado blanco (dark: `bg-[#1C1C1E] border border-white/10`), `rounded-3xl`, `shadow-2xl`, ancho ~720px, alto máx `70vh`.
- Estructura interna:
  - Header: buscador (`Search` icon + input) con `placeholder="Buscar widgets…"` filtrando por nombre/descripción.
  - Grid de **3 columnas** con scroll vertical (`overflow-y-auto scrollbar-hide`).
  - Cada card de widget: ícono grande + nombre + descripción corta. Hover eleva ligeramente (`hover:-translate-y-0.5`). Clic → inserta el widget en el canvas y cierra el pop-up.
- Registro de widgets desde `src/components/widgets/registry.ts` (lista extensible) — arrancamos con **1 entrada**: "Pizarra".

## 3. Widget "Pizarra" (nodo kanbanNode)

**Nuevo nodo:** `src/components/nodes/KanbanNode.tsx`
Sigue el patrón de `TodoNode`/`ShapeNode`:
- Registrado en `nodeTypes` de `src/pages/Index.tsx` como `kanbanNode`.
- **Sin handles de conexión** — no incluye `<Handle>` de React Flow (por lo tanto no conectable con líneas), pero sí incluye `<NodeExtendHandles />` (mismo patrón que TodoNode) para permitir extenderlo con IA. Confirmar con el usuario si tampoco quiere las handles de "ampliar con IA"; por defecto las mantengo consistentes con el resto.
- Escalable con `<NodeResizer />` (min 400x300).
- Barra flotante superior cuando `isSingleSelected` (mismo patrón visual que ShapeNode/FrameNode): color de fondo, color de texto, mostrar/ocultar título, mostrar/ocultar subtítulo, eliminar.

### Datos del nodo (`KanbanNodeData`)
```ts
type KanbanCard = {
  id: string;
  title: string;
  subtitle?: string;
  url?: string;              // link opcional
  fields?: { id: string; label: string; value: string }[]; // campos extra
};
type KanbanColumn = { id: string; title: string; cards: KanbanCard[] };
type KanbanNodeData = {
  title?: string;            // "Pizarra" por defecto
  showTitle?: boolean;       // true por defecto
  subtitle?: string;
  showSubtitle?: boolean;    // false por defecto
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;      // color de cabecera de columna
  columns: KanbanColumn[];
};
```
Al insertarse: 3 columnas iniciales ("Por hacer", "En progreso", "Hecho"), cada una vacía; título "Pizarra".

### UI interna
- Título editable (doble clic) arriba, si `showTitle`.
- Fila horizontal de columnas con `overflow-x-auto`; cada columna:
  - Cabecera con nombre editable (doble clic) + botón "..." con menú (Renombrar, Eliminar columna).
  - Lista vertical de cards.
  - Botón "+ Agregar card" al pie de la columna.
- Botón "+ Columna" al final de la fila.
- **Card**:
  - Fondo blanco (dark: `bg-white/5`), `rounded-xl`, sombra suave.
  - Título editable + subtítulo opcional + link opcional (chip con `Link2` icon) + campos personalizados (label:value).
  - Al hacer clic → abre un mini-panel inline (o popover) para editar todos los campos: título, subtítulo, URL, y "+ Agregar campo".
  - Botón papelera al hover para eliminar.
- **Drag & drop nativo (HTML5)**:
  - Cards: `draggable`, con `onDragStart` guardando `{cardId, fromColumnId}` en un ref del nodo (no `dataTransfer` global para evitar conflictos con React Flow).
  - Columnas: `onDragOver` (preventDefault) + `onDrop` que mueve la card al final o a la posición del hover.
  - Indicador visual (línea azul `#4059F1`) donde caerá.
  - Mientras se arrastra una card: aplicar `stopPropagation` y clase `nodrag` al contenedor para que React Flow no arrastre el nodo padre.
- Todos los inputs llevan clases `nodrag nopan` (patrón usado en ShapeNode/TodoNode).

## 4. Registro y creación

**`src/components/widgets/registry.ts`** (nuevo):
```ts
export type WidgetDef = {
  id: string;                 // "kanban"
  name: string;               // "Pizarra"
  description: string;        // "Organiza tarjetas por columnas de estado"
  icon: LucideIcon;           // Columns3
  createNode: () => Node;     // devuelve un Node listo para setNodes
};
export const WIDGETS: WidgetDef[] = [ kanbanWidget ];
```

**`src/pages/Index.tsx`:**
- Añadir `kanbanNode: KanbanNode` a `nodeTypes` (línea 56).
- Nueva callback `handleAddWidget(widget: WidgetDef)` que:
  - Calcula posición centrada usando `reactFlowInstance.screenToFlowPosition` (mismo patrón que `runGenerate`).
  - `setNodes(nds => [...nds, widget.createNode() con position ajustada])`.
- Pasar `handleAddWidget` a `AIPromptBar` como prop, y de ahí al `WidgetsPicker`.

## 5. Consideraciones

- **No tocar `Toolbar.tsx`** — los widgets son independientes.
- **No se conectan con líneas**: se logra omitiendo los `<Handle>` en `KanbanNode`. React Flow no puede iniciar edge desde un nodo sin handles.
- **Persistencia**: los widgets se guardan como cualquier otro nodo dentro de `flows.nodes` en Supabase (ya funciona automáticamente porque el auto-save serializa `nodes`).
- **Realtime/colab**: sin cambios adicionales — al ser un nodo estándar, `useFlowRealtime` propaga cambios de `data` (columnas/cards) igual que con TodoNode.
- **Dark mode**: uso el patrón `useTheme()` + `isDark ? ... : ...` que ya sigue el proyecto (ver `project-knowledge`).
- **i18n**: textos en español directos (el proyecto usa i18n solo en landing).

## Detalles técnicos

- **Ícono del botón Widgets**: `LayoutTemplate` de lucide-react (encaja visualmente con "Apps" que usa `LayoutGrid`).
- **Ícono de la Pizarra en el picker**: `Columns3` de lucide-react.
- **Selectores de color**: reusar constantes `RAINBOW_COLORS` (copiarlas al nodo o extraerlas a `src/lib/nodeColors.ts` — extraeré solo si es limpio, si no las duplico como ya se hace en ShapeNode/TodoNode/FrameNode).
- **IDs**: `crypto.randomUUID()` para cards/columnas/campos.
- **Tamaño inicial del nodo Pizarra**: 720×420, `style: { width: 720, height: 420 }`.

## Archivos afectados

Nuevos:
- `src/components/widgets/WidgetsPicker.tsx`
- `src/components/widgets/registry.ts`
- `src/components/nodes/KanbanNode.tsx`

Modificados:
- `src/components/AIPromptBar.tsx` (botón Widgets + estado del pop-up)
- `src/pages/Index.tsx` (registro en `nodeTypes` + `handleAddWidget` + prop al PromptBar)
