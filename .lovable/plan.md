

# Reemplazar Firecrawl por Tavily para búsqueda web

## Resumen
Cambiar el motor de búsqueda en la edge function `analyze-instagram` de Firecrawl a Tavily. Tavily es un API de búsqueda web optimizado para IA que devuelve resultados estructurados.

## Pasos

### 1. Guardar la API key de Tavily como secreto
Usar la herramienta `add_secret` para almacenar `TAVILY_API_KEY` con el valor que proporcionaste. Esta quedará disponible automáticamente en las edge functions.

### 2. Actualizar `supabase/functions/analyze-instagram/index.ts`
- Reemplazar `FIRECRAWL_API_KEY` por `TAVILY_API_KEY`
- Cambiar la llamada de `https://api.firecrawl.dev/v1/search` a `https://api.tavily.com/search`
- Adaptar el body al formato de Tavily:
  - `query`: búsqueda sobre el username de Instagram
  - `max_results`: 5
  - `include_raw_content`: false
- Parsear la respuesta de Tavily (formato: `results[]` con `title`, `url`, `content`)
- El resto (análisis con Gemini vía Lovable AI) se mantiene igual

### 3. Opcionalmente desconectar Firecrawl
Ya no será necesario el conector de Firecrawl.

## Detalle técnico
Tavily API endpoint: `POST https://api.tavily.com/search` con header `Authorization: Bearer <key>`. Respuesta incluye `results[].title`, `results[].url`, `results[].content`.

