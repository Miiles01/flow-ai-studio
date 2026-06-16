## Apps / Conectores por usuario (v1: UI + guardado + toggles)

Construir un menú "Apps" en la barra de IA del editor de flujos que despliega un panel con apps activables. Por defecto viene **"Búsqueda en la web"** (logo de Google) activada. El usuario puede agregar sus propias apps mediante un popup (estilo el modal de bienvenida), activarlas/desactivarlas, y todo se guarda por usuario en la base de datos. En esta versión la IA **aún no ejecuta** las apps — solo se prepara la base (UI + persistencia + toggles).

### 1. Base de datos
Nueva tabla `user_apps` (scoped a `auth.uid()`):
- `name` (texto, nombre que da el usuario)
- `connector_type` (`mcp` | `api`)
- `url` (endpoint del servidor MCP o API REST)
- `api_key` (token opcional)
- `enabled` (boolean, default true)
- `is_builtin` (boolean — para distinguir la app por defecto si se materializa)
- estándar: `id`, `user_id`, `created_at`, `updated_at`

RLS: el usuario solo ve/edita sus propias apps (`auth.uid() = user_id`). GRANTs a `authenticated` y `service_role`. Trigger de `updated_at`.

La app **"Búsqueda en la web"** se trata como built-in fija en el frontend (siempre presente, activada por defecto, su estado on/off también se guarda). No requiere fila salvo para recordar si el usuario la apagó.

### 2. Panel de Apps (nuevo componente `AppsMenu.tsx`)
- Se abre al hacer clic en el botón **Apps** de `AIPromptBar.tsx` (hoy es un `div` decorativo sin acción).
- Popover/menú con estética del proyecto (dark/light), similar a la captura de referencia: lista de apps con su ícono/inicial, nombre y un **switch** (toggle) a la derecha.
- Primer ítem fijo: **Búsqueda en la web** con logo de Google, activado por defecto.
- Debajo, las apps del usuario traídas de `user_apps`, cada una con toggle y opción de eliminar.
- Al final: botón **"+ Agregar app"** que abre el popup de creación.

### 3. Popup de creación (nuevo componente `AddAppModal.tsx`)
- Modal estilo `TutorialModal` (mismo lenguaje visual: overlay con blur, card redondeada).
- Campos:
  - **Nombre** de la app
  - **Tipo**: selector "Servidor MCP" o "API / Endpoint"
  - **URL** (endpoint MCP remoto o URL de la API)
  - **API key / token** (opcional)
- Validación con `zod` (nombre requerido, URL válida `https://`).
- Al guardar: inserta en `user_apps` para el usuario actual y refresca la lista.

### 4. Estado y persistencia
- Hook `useUserApps.ts`: carga, crea, actualiza (toggle enabled), elimina apps vía el cliente Supabase.
- El estado de toggles persiste en la DB; la built-in "Búsqueda en la web" guarda su on/off (en `user_apps` como fila built-in o en `profiles`/localStorage — se usará una fila `is_builtin` para mantenerlo en DB).

### 5. Integración con la barra
- `AIPromptBar.tsx`: convertir el chip "Apps" en botón que abre `AppsMenu`. Mantener el diseño actual (negro, redondeado).
- Sin cambios en `generate-flow` ni en la lógica de IA en esta versión (la ejecución por la IA queda para una fase posterior).

### Nota técnica
La opción "Tipo: Servidor MCP" guarda URL + token pero **no** se conecta ni ejecuta todavía. Cuando quieras la fase 2 (que la IA realmente llame estas herramientas), se añadirá la infraestructura MCP/AI SDK en el edge function `generate-flow`. Lo dejo preparado en el esquema para no migrar de nuevo.
