# Admin Dashboard — Plan

## Acceso (/admin)
- Nueva ruta pública `/admin` con pantalla de login simple (input password).
- Secret `ADMIN_PASSWORD` = `miiles24244053@AA`.
- Edge function `admin-auth` valida password y devuelve un token firmado (JWT con HS256 usando `ADMIN_PASSWORD` como secret, exp 8h). Guardado en `localStorage` (`miiles_admin_token`).
- Todas las edge functions admin verifican ese token en header `x-admin-token`.
- Ruta `/admin` envuelta en `<AdminGuard>` que valida token contra `admin-auth` (verify mode).

## Módulo 1 — Carga de datos (Prospectos)

**DB (migración):**
```
prospects (
  id uuid pk, name text, company text, email text, phone text,
  role text, industry text, location text, website text, notes text,
  tags text[], source_file text, raw jsonb, created_at, updated_at
)
```
- Índice GIN sobre `tags` y trigram sobre `name || company || industry` para búsqueda.
- RLS: bloqueada para `anon`/`authenticated` (solo accesible via service role desde edge functions admin).

**Edge function `admin-ingest`:**
- Body: `{ filename, mime, contentBase64 }` + header `x-admin-token`.
- CSV/Excel/TXT: parsea con `xlsx` (npm) → arrays de filas.
- PDF: extrae texto con `pdf-parse` (npm).
- Pasa filas/texto a Lovable AI Gateway (`google/gemini-3-flash-preview`) con `Output.object` y schema Zod `{ prospects: [{ name, company, email, phone, role, industry, location, website, notes, tags }] }`.
- Inserta en `prospects` con `source_file = filename`.

**UI tab "Prospectos":**
- Dropzone (drag&drop) + lista de últimos uploads.
- Tabla paginada con filtros (búsqueda, tag, industria).
- Acciones: borrar fila, borrar batch por `source_file`.

## Módulo 2 — Sync con IA del tablero

Modifica `supabase/functions/generate-flow/index.ts`:
- Antes de llamar al modelo, hace `supabase.from('prospects').select(...)` filtrando por keywords del prompt (ILIKE sobre name/company/industry/tags).
- Inyecta hasta 20 prospectos relevantes en el system prompt como "PROSPECTS DB (úsalos primero, no inventes si están aquí)".
- Inyecta también las plantillas (módulo 4) como ejemplos few-shot.
- Si no hay match, el modelo genera libremente (comportamiento actual).
- Sin cambios en el cliente.

## Módulo 3 — Instrucciones desde GitHub
**Decisión del usuario:** el flujo es "edito el repo con Claude Code → Lovable sincroniza con GitHub automáticamente". No se necesita webhook ni API de GitHub.

→ Las plantillas viven como archivos estáticos en `src/data/flow-templates/*.json`. Cuando el usuario edita en Claude Code y pushea, GitHub sync trae los archivos al proyecto Lovable.

**Edge function `list-flow-templates`** (público, sin auth admin):
- Lee plantillas vía import dinámico no es posible en edge → en su lugar mantenemos las plantillas también en una tabla `flow_templates` sincronizada al boot.

**Mejor enfoque (simplificado):** las plantillas son archivos JSON en `src/data/flow-templates/` y se exponen al edge function vía:
- Nueva tabla `flow_templates (id, slug, title, description, tags, nodes jsonb, edges jsonb, prompt_hint text)`.
- Botón "Sincronizar desde repo" en /admin que sube los archivos del frontend (lee `import.meta.glob('@/data/flow-templates/*.json')`) → edge function `admin-sync-templates` upsert por slug.
- Así el usuario edita JSON en GitHub via Claude Code y luego presiona "Sincronizar" en /admin.

## Módulo 4 — Ejemplos de flujos / nodos
- Tab "Plantillas" en /admin: lista de plantillas de `flow_templates`, preview de cada una (nombre, descripción, conteo nodos/edges, tags).
- Botón "Sincronizar desde repo" arriba.
- Botón "Borrar" por plantilla.
- Las plantillas se inyectan en `generate-flow` (módulo 2).

## Archivos

**Nuevos:**
- `src/pages/Admin.tsx` — layout con tabs (Prospectos, Plantillas).
- `src/pages/AdminLogin.tsx` — form password.
- `src/components/admin/AdminGuard.tsx`
- `src/components/admin/ProspectsTab.tsx`
- `src/components/admin/TemplatesTab.tsx`
- `src/components/admin/FileDropzone.tsx`
- `src/hooks/useAdminAuth.ts`
- `src/data/flow-templates/example-prospecting.json` (seed)
- `src/data/flow-templates/example-content.json` (seed)
- `supabase/functions/admin-auth/index.ts`
- `supabase/functions/admin-ingest/index.ts`
- `supabase/functions/admin-prospects/index.ts` (list/delete)
- `supabase/functions/admin-sync-templates/index.ts`
- Migración SQL.

**Modificados:**
- `src/App.tsx` — rutas `/admin` y `/admin/login`.
- `supabase/functions/generate-flow/index.ts` — inyección de prospectos + plantillas.

## Secrets
- `ADMIN_PASSWORD` (add_secret).

## Fuera de alcance
- Webhook GitHub (sustituido por botón sincronizar).
- Edición visual de plantillas (se editan via Claude Code en el repo).
- 2FA/recovery del admin.

## Diagrama
```
Admin UI ─► admin-auth ──► JWT
        ─► admin-ingest ─► [parse + Gemini] ─► prospects table
        ─► admin-sync-templates ─► flow_templates table
        
User chat ─► generate-flow ──► fetch prospects+templates ─► Gemini ─► flow
```