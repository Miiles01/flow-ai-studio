
# Colaboración en tiempo real para Tableros

Sistema tipo Figma para compartir y co-editar tableros. **Solo disponible para usuarios Pro**. Soporta invitación por email (a usuarios existentes), enlace público híbrido (anónimo puede entrar; si inicia sesión se agrega a sus tableros), roles **Editor/Viewer**, sincronización en vivo de nodos/edges y avatares de presencia.

---

## 1. Modelo de datos (migración)

### `flows` — añadir columnas
- `is_public boolean` (default false) — si el link público está activo
- `public_token uuid` (default gen_random_uuid, unique) — token del link
- `public_role text` (default 'editor', check 'viewer'|'editor')

### Nueva tabla `flow_collaborators`
| campo | tipo | notas |
|---|---|---|
| `id` | uuid PK | |
| `flow_id` | uuid | FK → flows |
| `user_id` | uuid | usuario invitado |
| `role` | text | 'viewer' \| 'editor' |
| `added_by` | uuid | quién lo invitó |
| `added_at` | timestamptz | |

Unique `(flow_id, user_id)`.

### RLS — flows
- **SELECT**: `auth.uid() = user_id` **OR** existe fila en `flow_collaborators` para ese flow y usuario. (vía función `can_access_flow(flow_id)` SECURITY DEFINER para evitar recursión)
- **UPDATE**: owner **OR** colaborador con `role='editor'`. (vía `can_edit_flow(flow_id)`)
- **DELETE**: solo `auth.uid() = user_id` (solo el dueño borra de verdad)
- **INSERT**: sin cambios

### RLS — flow_collaborators
- **SELECT**: dueño del flow, o el propio colaborador
- **INSERT / UPDATE / DELETE**: solo el dueño del flow, **excepto** que un colaborador puede borrarse a sí mismo ("quitar de mis tableros")

### Funciones SECURITY DEFINER
- `can_access_flow(flow_id uuid) returns bool` — owner o colaborador
- `can_edit_flow(flow_id uuid) returns bool` — owner o colaborador editor
- `join_flow_by_token(p_token uuid) returns uuid` — usado por usuarios logueados que entran por link público; agrega fila en `flow_collaborators` con `role = flows.public_role` y devuelve el `flow_id`
- `get_public_flow(p_token uuid) returns flows` — devuelve el flow para visitantes anónimos cuando `is_public = true` (permite render sin login)

### Realtime
`ALTER PUBLICATION supabase_realtime ADD TABLE flows, flow_collaborators;` para refrescar listas y permisos al instante.

---

## 2. UI — Modal de Compartir

Botón **Compartir** en el header del editor (`Index.tsx`), al lado del icono de Settings. Solo visible para el **dueño**. Si el usuario es Free, abre un modal de upsell hacia `/pricing` en lugar del modal de compartir.

### Modal (shadcn `Dialog`) — dos secciones
1. **Invitar por email**
   - Input email + selector de rol (Editor/Viewer) + botón "Invitar"
   - Resuelve email → user_id contra `profiles` vía RPC `find_user_by_email`
   - Si no existe: toast "Este usuario aún no tiene cuenta en Miiles"
   - Lista de colaboradores debajo con avatar, nombre, dropdown de rol y botón "Quitar"

2. **Enlace público**
   - Switch "Cualquiera con el enlace puede acceder"
   - Selector de rol del link (Editor/Viewer)
   - Input readonly con la URL `https://app/boards/join/{public_token}` + botón Copiar

---

## 3. Ruta `/boards/join/:token`

Página puente que cubre los tres casos del flujo "Híbrido":

- Llama `get_public_flow(token)`. Si no existe o `is_public=false` → 404.
- **Si hay sesión**: ejecuta `join_flow_by_token(token)` (idempotente por unique), luego `navigate(/boards/{flow_id}, { replace: true })`.
- **Si no hay sesión**: muestra preview con nombre del tablero + dos botones: **"Editar como invitado"** (entra directo al editor en modo anónimo) y **"Iniciar sesión y guardar en mis tableros"** (manda a `/login?next=/boards/join/{token}`).

`Login.tsx` / `Register.tsx` ya redirigen a `/dashboard`; se respeta el query `?next=` para regresar al join.

---

## 4. Editor (`Index.tsx`) — modo colaborativo

### Carga
- Detecta si el usuario es **owner**, **collaborator** (con rol), o **anónimo público** (sin user, vía token en query).
- Para anónimo: en lugar de `supabase.from('flows').select()`, llama RPC `get_public_flow` y desactiva el guardado a DB (solo broadcast).
- Variable `canEdit`: true si owner, collaborator editor, o anon con `public_role=editor`.
- Si `!canEdit` → `nodesDraggable={false}`, `nodesConnectable={false}`, oculta toolbar/drawing, muestra pill "Solo lectura".

### Botón Compartir
- Solo visible si owner. Pro-gated.
- Si el usuario actual es colaborador, mostrar en su lugar un menú "Salir del tablero" (borra su fila en `flow_collaborators`).

### Sincronización en vivo (Supabase Realtime — broadcast)
- Canal `flow:{flow_id}` con `{ config: { broadcast: { self: false }, presence: { key: user.id || anonId } } }`.
- **Sender**: en el `useEffect` que ya marca dirty, también emite `channel.send({ type:'broadcast', event:'state', payload:{ nodes, edges, by: clientId, ts } })` con throttle de ~120ms (no debounce — necesitamos fluidez al mover).
- **Receiver**: al recibir, hace `setNodes/setEdges` con la versión remota **solo si** `payload.ts > lastLocalTs` (last-write-wins por timestamp + clientId como desempate).
- Flag `isApplyingRemoteRef` para que el cambio remoto no dispare otro broadcast ni alimente el history undo.
- La persistencia a DB se mantiene tal cual (debounce 800ms): cualquier editor escribe; los demás reciben el estado y al recargar leen de DB. No hay merge fino — es suficiente para esta primera versión.

### Presencia (avatares activos)
- En el canal, `channel.track({ user_id, display_name, avatar_url, color })` al unirse.
- Componente `PresenceStack` en el header (arriba a la derecha, antes de Undo/Redo): stack de avatares con tooltip de nombre. Anónimos aparecen como "Invitado" con color generado.

---

## 5. Página "Mis Tableros" (`Boards.tsx`)

- Query owned: `flows where user_id = me`
- Query shared: `flow_collaborators` join `flows` where `user_id = me`
- Render en **dos secciones**: "Mis tableros" y "Compartidos conmigo" (cada uno con su grid existente).
- Las cards compartidas llevan un badge sutil "Compartido" + nombre del dueño.
- Botón rojo de eliminar:
  - **Owner** → DELETE flow (cascada borra colaboradores)
  - **Colaborador** → DELETE su fila en `flow_collaborators` con toast "Quitado de tu lista"
- Conteo `X/10` solo cuenta tableros **propios**. Los compartidos no consumen cuota.
- Realtime subscription a `flow_collaborators` filtrada por su user_id → refresh automático cuando alguien los invita.

---

## 6. Gating de plan Pro

- Hook `usePlan()` que lee `profiles.plan`.
- En `Index.tsx`: el botón Compartir se muestra siempre al owner, pero si `plan !== 'pro'` abre `UpgradeDialog` con CTA a `/pricing`.
- Los usuarios Free **sí pueden** ser invitados a colaborar y editar tableros de un Pro (no tendría sentido limitar al revés).

---

## 7. Aspectos técnicos

**Conflict handling**: last-write-wins por timestamp del emisor. Cada cliente ignora broadcasts cuyo `ts` sea menor al último estado local conocido. Para esta primera versión esto es suficiente y predecible; un CRDT (Yjs) sería trabajo de otro sprint.

**Throttle vs debounce**: el broadcast usa throttle de 120ms (no debounce) para que el arrastre se vea fluido. La escritura a DB sigue con debounce de 800ms para no saturar Postgres.

**Anti-loop**: ref `isApplyingRemoteRef` impide que `setNodes` desde un broadcast remoto vuelva a emitir o se guarde como entrada de undo.

**Seguridad del link público**: el token es un uuid v4 (122 bits), suficientemente impredecible. Al desactivar `is_public` se rota opcionalmente el token con un botón "Regenerar enlace".

**Cuota**: tableros compartidos **no cuentan** contra el límite de 10 del plan Free.

---

## 8. Archivos a tocar

**Nuevos**
- `src/components/ShareDialog.tsx`
- `src/components/PresenceStack.tsx`
- `src/hooks/useFlowRealtime.ts` (broadcast + presence)
- `src/hooks/useFlowAccess.ts` (resuelve owner/collaborator/anon + canEdit + role)
- `src/hooks/usePlan.ts`
- `src/pages/JoinFlow.tsx` (ruta `/boards/join/:token`)

**Modificados**
- `src/pages/Index.tsx` — botón Compartir, presencia, sincronización, modo solo-lectura, soporte anónimo
- `src/pages/Boards.tsx` — sección "Compartidos conmigo", lógica de "quitar" vs "borrar"
- `src/pages/Login.tsx`, `src/pages/Register.tsx` — respetar `?next=` para volver al join tras login
- `src/App.tsx` — registrar ruta `/boards/join/:token`

**Migración SQL única** con: columnas en flows, tabla flow_collaborators, RLS actualizadas, 4 funciones SECURITY DEFINER, publicación realtime.

---

## 9. Fuera de alcance (lo dejamos para una siguiente iteración)

- Cursores en vivo por usuario en el canvas
- Sistema de comentarios
- Invitación a usuarios que aún no tienen cuenta (con envío de email vía Resend)
- CRDT real para merge sin conflictos a nivel de propiedad
