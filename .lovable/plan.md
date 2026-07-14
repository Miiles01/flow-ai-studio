## Problema

La IA siempre entrega listas de tareas (`todoNode`), incluso cuando el usuario pide algo conceptual/teórico ("¿qué es el marketing?", "explícame X"). No distingue entre intención de **aprender** vs intención de **planear/ejecutar**.

## Solución

Agregar una etapa de **clasificación de intención de contenido** en `supabase/functions/generate-flow/index.ts` y adaptar el system prompt según el modo detectado.

### 1. Nuevo clasificador `classifyContentMode`

Función ligera (Gemini flash) antes de generar el flujo. Devuelve uno de tres modos:

- `learn` — el usuario quiere entender / aprender / le expliquen un concepto, teoría, fundamentos ("qué es", "explícame", "cómo funciona", "diferencias entre", "conceptos de").
- `plan` — el usuario quiere un plan accionable, pasos, checklist, estrategia a ejecutar ("crea un plan", "pasos para", "estrategia de lanzamiento", "tareas para").
- `mixed` — combinación (por defecto cuando hay ambigüedad).

Prompt del clasificador breve, en español, salida JSON: `{"mode":"learn"|"plan"|"mixed"}`.

### 2. Adaptar el system prompt por modo

Añadir un bloque `MODO DE CONTENIDO` inyectado dinámicamente en `systemPrompt`:

- **learn**: 
  - PROHIBIDO usar `todoNode` salvo que el usuario lo pida explícitamente.
  - Priorizar `shapeNode` (circle/hexagon/diamond para categorías, conceptos, relaciones) + `textNode` con HTML rico (definiciones, ejemplos, `<b>`, `<i>`, listas cortas explicativas — no tareas).
  - Estructura tipo mapa conceptual / esquema visual: nodo central con el concepto, ramas con subconceptos, hojas con definiciones/ejemplos.
  - Los `textNode` explican con oraciones completas ("El marketing es…"), no con verbos de acción.
  - Edges con etiquetas cortas cuando ayuden a mostrar la relación (ej. "incluye", "se divide en").

- **plan**:
  - Comportamiento actual: `todoNode` con tareas accionables, fases, checklists.

- **mixed**:
  - Empezar con nodos conceptuales (shape + text) y luego uno o dos `todoNode` para la parte accionable.

### 3. Ajustes menores en las reglas globales

- Añadir regla explícita al system prompt: **"No conviertas todo en checklist. Elige el tipo de nodo según la intención: conceptos → shapeNode + textNode; acciones → todoNode."**
- Aclarar que `textNode` puede (y debe, en modo learn) contener explicaciones largas en HTML, no solo títulos.

### 4. Respuesta al frontend

Incluir `content_mode` en el JSON de respuesta (informativo, sin cambios de UI necesarios).

## Detalles técnicos

Archivo: `supabase/functions/generate-flow/index.ts`.

- Añadir `async function classifyContentMode(prompt, apiKey): Promise<"learn"|"plan"|"mixed">` cerca de `classifyIntent`.
- Llamarla en `serve` en paralelo con la clasificación existente de Apify (`Promise.all`) para no añadir latencia serial.
- Construir un `modeGuidance` string y concatenarlo al `systemPrompt` justo antes de `apifyBlock`.
- Incluir `content_mode: mode` en el `Response` final.

No se cambia el frontend ni `src/lib/generateFlow.ts`.

## Fuera de alcance

- No tocar el UI del canvas ni componentes de nodo.
- No cambiar el modelo por defecto.
- No modificar `PlanPanel` ni el flujo de aprobación de plan.
