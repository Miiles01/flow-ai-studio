# Persistir todo el contenido del tablero

## Diagnóstico

El autosave en `src/pages/Index.tsx` (debounce 1.2s sobre `nodes`/`edges`/`name`) **ya guarda correctamente**:
- Todas las propiedades de `ShapeNode`: forma, label, `fillColor`, `strokeColor`, `fontSize`, `bold`, `italic`, `underline`, posición y tamaño (vía `style.width`/`height` del `NodeResizer`).
- Posiciones, conexiones y el `animated` de cada edge.

**Pero `TextNode` (el editor de texto rico) NO se persiste**, porque:

1. El **HTML del editor** vive solo en el DOM (`contentEditable`). Nunca se escribe de vuelta a `node.data.html` después de la primera siembra → al recargar se pierde todo lo escrito.
2. `fontSize` y `align` son `useState` **locales** del componente → no llegan a `node.data` → no disparan autosave ni se restauran tras recargar.
3. Al cargar un tablero existente, el componente ignora el `fontSize` y `align` guardados porque arranca con los defaults `15` / `"left"`.

Como el autosave detecta cambios mirando la referencia de `nodes`, mientras `TextNode` no llame a `setNodes` ningún cambio del editor disparará un guardado.

## Cambios

### 1. `src/components/nodes/TextNode.tsx` — escribir cambios a `node.data`

Extender `TextNodeData`:
```ts
export type TextNodeData = {
  html?: string;
  fontSize?: number;
  align?: "left" | "center" | "right";
};
```

- **Inicializar estado desde `data`** en lugar de constantes hardcoded:
  - `useState(nodeData.fontSize ?? 15)`
  - `useState<"left"|"center"|"right">(nodeData.align ?? "left")`
- **Sembrar el editor desde `nodeData.html`** la primera vez (ya lo hace) y **re-sembrar** si `nodeData.html` cambia y el editor no está enfocado (para soportar recargas/cargas de otro tablero).
- Añadir helper `commitData(patch)` que llame a `setNodes` (de `useReactFlow`) para actualizar la `data` de ese nodo (mismo patrón que `ShapeNode.updateNodeData`).
- **Persistir HTML**: en `onInput` (después de `styleLinks`), debounce ~250ms y llamar `commitData({ html: editorRef.current.innerHTML })`. También `commitData` en `onBlur` para flush inmediato.
- **Persistir fontSize**: cuando cambia el estado local, `commitData({ fontSize })`.
- **Persistir alineación**: cuando cambia `align`, `commitData({ align })`.
- Los comandos de formato (`bold`/`italic`/`underline`/`createLink`/`unlink`) mutan el DOM → ya disparan `onInput` → quedarán guardados al hacer el commit del HTML.

### 2. `src/pages/Index.tsx` — limpiar fields efímeros antes de guardar

Antes de serializar para Supabase, mapear `nodes` quitando los campos volátiles que React Flow añade en runtime, así:
- el diff `lastSavedRef` es estable (sin falsos positivos por `selected`/`dragging`),
- al recargar no aparece nada seleccionado o "siendo arrastrado".

```ts
const sanitize = (n) => {
  const { selected, dragging, resizing, ...rest } = n;
  return rest;
};
// payload.nodes = nodes.map(sanitize);
// payload.edges = edges.map(({ selected, ...rest }) => rest);
```

### 3. Verificación manual

Crear un tablero, añadir:
- Una figura (cambiar color, tamaño, label, fontSize, bold).
- Un nodo de texto con HTML enriquecido (negrita, link, alineación centro, fontSize 24).
- Conectar varias figuras.

Recargar la página → todo debe verse exactamente igual.

## Archivos tocados

- `src/components/nodes/TextNode.tsx` (cambios principales)
- `src/pages/Index.tsx` (sanitización en `persist`)
