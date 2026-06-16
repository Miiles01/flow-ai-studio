# Plan: Los prospectos no cargan en el Admin (CORS bloquea x-admin-token)

## Diagnóstico
- La tabla `prospects` tiene 100 registros y **ya está habilitada para realtime** (`supabase_realtime` la incluye). El realtime no es el problema.
- El panel muestra "Sin prospectos" y un toast **"Failed to send a request to the Edge Function"**.
- En los logs: el preflight `OPTIONS` de `admin-prospects` responde 200, pero el `POST` nunca se ejecuta.
- Causa raíz: las funciones importan `corsHeaders` desde `@supabase/supabase-js@2/cors`, cuyo `Access-Control-Allow-Headers` es `authorization, x-client-info, apikey, content-type` y **no incluye `x-admin-token`**. El cliente (`adminFetch` en `useAdminAuth.ts`) envía ese header, así que el navegador bloquea la petición real. El login (`admin-auth`) funciona porque no manda `x-admin-token`.

## Cambios

### 1. Definir CORS propio con `x-admin-token`
En cada función admin reemplazar el import de cors por un objeto local que permita el header:

```ts
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
```

Aplicar en:
- `supabase/functions/admin-prospects/index.ts`
- `supabase/functions/admin-ingest/index.ts`
- `supabase/functions/admin-auth/index.ts` (por consistencia)

Quitar la línea `import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";` en cada una.

### 2. Desplegar las funciones
Deploy de `admin-prospects`, `admin-ingest` y `admin-auth`.

### 3. Verificar
- Recargar `/admin`, confirmar que la tabla lista los 100 prospectos sin el toast de error.
- Confirmar que la suscripción realtime ya existente en `ProspectsTab.tsx` refresca la tabla al insertar/borrar.

## Notas
- No se requiere migración: el realtime ya está activo.
- No se toca la UI ni la lógica de negocio, solo headers CORS de las edge functions.
