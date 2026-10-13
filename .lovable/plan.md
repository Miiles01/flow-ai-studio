# Descubrimientos siempre visible + errores con tu propio modelo

## 1. Quitar el botón de ocultar en Descubrimientos
En tu panel de inicio, la sección "Descubrimientos" tiene un botón con un ojo tachado que oculta los videos. Lo quito por completo, así la sección siempre se muestra para todos.

## 2. Por qué falla tu propio modelo
Revisé los registros: tu llave sí funciona. El error viene de Google: el modelo Gemini 3.6 Flash respondió "demasiada demanda, intenta más tarde" (error 503). La app lo intenta de nuevo un par de veces y, si sigue fallando, muestra un error genérico que no explica nada.

Arreglo:
- Más reintentos con espera creciente (unos 1, 2 y 4 segundos) cuando Google o cualquier proveedor está saturado.
- Si sigue saturado, se usa el modelo incluido de Miiles para que tu tablero se genere de todos modos, y te aviso con un mensaje corto ("Tu modelo estaba saturado, usamos el de Miiles").
- Si el modelo incluido tampoco está disponible, te muestro un mensaje claro: "Google está saturado ahora mismo, intenta en un minuto o cambia de modelo en Apps → Modelos", en lugar del error genérico.
- Aplica a crear tableros, a planear/aclarar y a "Editar con IA" en los widgets.

## Detalles técnicos
- `src/pages/Dashboard.tsx`: eliminar el estado `showDiscoveries`, el botón Eye/EyeOff y la condición que envuelve el contenido.
- `callLLM` (compartido en las funciones de IA): reintentos con backoff para 500/502/503/504/529.
- `generate-flow`, `plan-flow`, `clarify-flow`, `widget-ai`, `edit-widget`: ante un 503 persistente con BYOK, recurrir al Lovable AI Gateway (modelo por defecto) y devolver `fallbackUsed: true`; si todo falla, devolver 503 con `{ error, switchModel: true }`.
- Frontend (`Index.tsx`, `widgetAI.ts`): toast informativo cuando se usa el modelo de respaldo, y toast de "proveedor saturado" con acceso a Apps → Modelos.
- Antes de editar: `git fetch` + `git status`.
