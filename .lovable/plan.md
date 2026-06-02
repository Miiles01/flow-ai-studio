# Plan: Prospectos en la IA, embeds en canvas y admin en tiempo real

## Objetivo
1. La IA del canvas usa la base de prospectos como fuente y entiende los objetivos del cliente.
2. La IA puede insertar el sitio web del prospecto como **iframe embebido** en el canvas cuando lo considere útil según el plan/objetivos.
3. El dashboard de Admin muestra la base de prospectos **siempre actualizada en tiempo real**.

---

## Parte 1 — Nuevo nodo de embed (iframe del sitio web)

Hoy existen los nodos `shapeNode`, `todoNode`, `textNode`, `imageNode`. No hay forma de mostrar una página web embebida. Se crea uno nuevo.

- **Crear `src/components/nodes/EmbedNode.tsx`**: similar a `ImageNode`, renderiza un `<iframe>` con `data.url`. Incluye:
  - Estado vacío ("Pegar URL del sitio") + popover para editar URL (como ImageNode).
  - `NodeResizer`, handles de conexión, barra flotante (editar URL / abrir en nueva pestaña / eliminar).
  - `sandbox` y `referrerPolicy` seguros; fallback visible si el sitio bloquea ser embebido (X-Frame-Options) con botón "Abrir sitio".
  - Estilos dark/light según el sistema de diseño Miiles.
- **Registrar el tipo** en `src/pages/Index.tsx` (`nodeTypes` línea 50) como `embedNode: EmbedNode`.
- Manejarlo en el guardado/realtime igual que el resto (no requiere cambios, ya viaja en `nodes`).

## Parte 2 — IA: usar prospectos y decidir embeds (edge function `generate-flow`)

Archivo: `supabase/functions/generate-flow/index.ts`.

- **Recolección de prospectos más robusta**: además del match por keywords actual, si no hay coincidencias traer un set base reciente para dar contexto; ampliar el `select` para incluir `website`.
- **Actualizar el system prompt** para:
  - Indicar que debe **recolectar el contexto y objetivos del cliente** a partir del prompt y proponer el flujo en función de ellos.
  - Documentar el nuevo `embedNode`: `{"type":"embedNode","data":{"url":"https://..."},"style":{"width":480,"height":320}}`.
  - Regla: cuando un prospecto tenga `website`, la IA **puede** insertar un `embedNode` con ese sitio si lo considera útil para el plan/objetivos (no siempre obligatorio). Usar la `website` real del prospecto, nunca inventar URLs.
- El cliente (`src/lib/generateFlow.ts`) ya pasa los nodos tal cual al canvas; solo se añade `embedNode` a la lista de tipos válidos mencionados en su prompt de instrucciones.

## Parte 3 — Admin: prospectos en tiempo real

Archivo: `src/components/admin/ProspectsTab.tsx`.

- Suscribir un canal de Supabase Realtime a `postgres_changes` (event `*`, tabla `public.prospects`) y, al recibir cambios, recargar vía `load()` (con un pequeño debounce para lotes de importación masiva).
- Limpiar el canal en el `return` del `useEffect`.
- `ProspectBrain` se re-renderiza automáticamente al actualizarse `prospects`.

### Migración (realtime)
Habilitar realtime en la tabla:
```sql
ALTER TABLE public.prospects REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prospects;
```
RLS actual ya restringe `prospects` a admins; el panel usa token admin vía edge functions, así que tras recibir el ping de realtime se recarga con `adminFetch` (service role), evitando problemas de RLS en el cliente.

---

## Detalles técnicos / notas
- El iframe puede ser bloqueado por sitios con `X-Frame-Options: DENY`/`frame-ancestors`. Por eso el `EmbedNode` incluye fallback con enlace "Abrir sitio" en vez de quedar en blanco.
- No se tocan landing/auth ni el flujo de guardado del canvas.
- Verificación: generar un flujo pidiendo prospectos + "agrega su sitio web" y confirmar que aparece el iframe; importar un CSV en Admin y ver la tabla actualizarse sin recargar.

## Archivos afectados
- `src/components/nodes/EmbedNode.tsx` (nuevo)
- `src/pages/Index.tsx` (registrar nodeType)
- `supabase/functions/generate-flow/index.ts` (RAG + prompt)
- `src/lib/generateFlow.ts` (mención del nuevo tipo)
- `src/components/admin/ProspectsTab.tsx` (realtime)
- Migración: habilitar realtime en `prospects`
