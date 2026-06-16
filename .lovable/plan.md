# Extender flujo con IA desde cualquier componente

## Objetivo
Al pasar el cursor cerca de un lado (arriba/abajo/izquierda/derecha) de cualquier componente del canvas (forma, texto, lista de tareas, imagen, sección — nunca las líneas/edges), aparece una cajita blanca con una estrella negra. Al hacer clic, esa cajita se "selecciona" (estado activo, bien resuelto en light y dark mode) y se abre el input de IA. Lo que el usuario escriba genera nuevos componentes **a partir de ese elemento**, leyendo su contenido y continuando el flujo en la dirección elegida, conectados con una línea.

## Experiencia
```text
        [ ✦ ]   ← cajita blanca + estrella negra (hover arriba)
[ ✦ ] [ COMPONENTE ] [ ✦ ]
        [ ✦ ]   ← al hacer clic: se activa, abre input, IA genera hacia abajo
```

## Componente compartido nuevo: `NodeExtendHandles`
`src/components/nodes/NodeExtendHandles.tsx`
- Recibe `nodeId` y se monta dentro de cada nodo.
- Renderiza 4 zonas de hover (top/bottom/left/right), una por lado, justo por fuera del borde del nodo (sin tapar las bolitas de conexión).
- En hover de un lado aparece una cajita blanca redondeada con la estrella negra (icono importado del SVG subido `Estrella.svg`).
  - Light: caja `bg-white` borde sutil + estrella negra.
  - Dark: caja `bg-[#1C1C1E]` borde `white/10` + estrella (invertida a blanca en dark).
  - Estado activo (cuando ese lado fue clicado): caja oscura/resaltada con `ring` azul de marca.
- Escala con el zoom (igual patrón que las toolbars: `scale(1/zoom)`).
- Al hacer clic dispara un callback global (ver contexto abajo) con `{ nodeId, side }`.

Se importa y se renderiza en: `ShapeNode`, `TextNode`, `TodoNode`, `ImageNode`, `FrameNode`. (Los edges quedan excluidos por definición.)

## Conexión nodo → página (contexto de extensión)
- Nuevo contexto ligero `FlowExtendContext` (o un callback pasado por `nodeTypes`/evento) para que `NodeExtendHandles` avise a `Index.tsx`.
- En `Index.tsx` se guarda estado `extendTarget: { nodeId, side } | null`.
- Al setear `extendTarget`: se abre el `AIPromptBar` expandido y se muestra un pequeño rótulo ("Ampliando desde este elemento") + botón para cancelar. El lado activo se marca como seleccionado en el nodo.

## Generación a partir del elemento
- Cuando hay `extendTarget`, `AIPromptBar.onGenerate` enruta a una nueva función `runExtendGenerate(prompt, extendTarget)` en lugar del flujo normal de clarify/plan (generación directa, más rápida, como pidió el usuario).
- `runExtendGenerate`:
  1. Lee el nodo origen de `nodes` y arma un resumen de su contenido (tipo, label/título/subtítulo/tareas/texto).
  2. Llama a `generateFlowFromPrompt` con un `context` nuevo que describe: el elemento origen, su contenido, la dirección (side) y la instrucción de "continuar/ampliar el flujo a partir de aquí".
  3. Coloca los nodos generados **desplazados desde el nodo origen** según el lado: right → +X, left → −X, bottom → +Y, top → −Y (usando bounding box + offset desde la posición del origen).
  4. Crea un edge desde el `handle` del lado elegido del nodo origen hacia el primer nodo generado (reutiliza la lógica de `sourceHandle`/`targetHandle` opuesta ya existente).
  5. `fitView` a los nodos nuevos, igual que hoy.
- `generateFlowFromPrompt` (`src/lib/generateFlow.ts`) acepta un parámetro opcional `extendContext` que se inyecta al prompt.

## Backend (`supabase/functions/generate-flow/index.ts`)
- Aceptar campo opcional en el body con el contexto del elemento origen y la dirección.
- Añadir al system/user prompt una sección de "MODO AMPLIACIÓN": instruir a la IA a leer el elemento origen, entender de dónde parte y **continuar** generando nuevos nodos coherentes (sin repetir el origen), respetando dirección y estilo. Mantener el resto del comportamiento intacto.

## Detalles técnicos
- Icono: importar `Estrella.svg` subido a `src/assets/miiles/` y usarlo como `<img>` dentro de la cajita (invertible en dark con filtro o variante).
- Las zonas de hover usan `nodrag nopan` y `stopPropagation` para no mover el nodo ni iniciar conexión.
- No tocar landing/auth. Respetar tokens y patrones de dark mode del sistema de diseño.
- Reusar `assignOptimalHandles` para los edges nuevos.

## Verificación
- Probar en una lista de tareas (caso del usuario): hover abajo → estrella → clic → input → "qué otras tareas pueden salir" → genera hacia abajo conectado.
- Probar en forma, texto, imagen y sección, en los 4 lados, en light y dark.
- Confirmar que las líneas/edges no muestran la estrella.
