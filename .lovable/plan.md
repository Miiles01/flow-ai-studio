# Revisión de la generación de flujos

## Diagnóstico

La generación de flujos usa 3 funciones de backend en cadena, disparadas desde la barra de IA (`AIPromptBar` → `handleAIGenerate` en `src/pages/Index.tsx`):

```text
Prompt del usuario
   → clarify-flow   (¿hace falta aclarar? preguntas)
   → plan-flow      (plan estratégico para aprobar)
   → generate-flow  (nodos + edges finales para el canvas)
```

**Problema principal encontrado:** las funciones de backend **no están respondiendo**. Al probar los endpoints desplegados directamente, TODAS devuelven `404 NOT_FOUND_FUNCTION_BLOB`:

```text
generate-flow  → 404
plan-flow      → 404
clarify-flow   → 404
chat           → 404   (también afectada)
```

Esto significa que el código de las funciones existe en el repositorio, pero **no está desplegado/activo** en el backend. Con esto, la generación de flujos falla siempre: `clarify-flow` y `plan-flow` "fallan en silencio" (siguen de largo), pero `generate-flow` lanza error y solo se ve un toast de "Error al generar el flujo". Los tableros que ya existen en la cuenta son flujos guardados previamente, no generados ahora.

## Objetivo

Dejar la generación de flujos funcionando de punta a punta y hacerla más robusta ante respuestas imperfectas de la IA.

## Cambios propuestos

1. **Redesplegar las funciones Edge de flujos** (`generate-flow`, `plan-flow`, `clarify-flow`) junto con su código compartido en `_shared/` (`flow-instructions.ts`). Redesplegar también `chat` ya que muestra el mismo síntoma.

2. **Verificación end-to-end (obligatoria antes de dar por cerrado):**
   - Probar cada función desplegada y confirmar respuesta `200`.
   - Ejecutar una generación real en la vista previa (prompt de prueba) y confirmar que aparecen nodos en el canvas, sin errores en consola/red.

3. **Endurecer el manejo de errores en el cliente** (`src/lib/generateFlow.ts`), para que fallos futuros no dejen al usuario sin contexto:
   - Corregir el mensaje engañoso "La IA no generó pasos válidos": distinguir entre "no llegaron nodos" y "llegaron nodos sin `position`" (hoy cae al fallback antiguo y confunde).
   - Aceptar nodos aunque el primero no traiga `position` (asignar posición por defecto en vez de descartar toda la respuesta).

## Notas técnicas (para referencia)

- Cliente: `src/lib/generateFlow.ts` (`supabase.functions.invoke("generate-flow")`), `src/lib/planFlow.ts`, `src/lib/clarifyFlow.ts`.
- Orquestación en `src/pages/Index.tsx`: `handleAIGenerate`, `proceedToPlanning`, `runGenerate`, `runExtendGenerate`.
- Funciones: `supabase/functions/generate-flow|plan-flow|clarify-flow/index.ts`, modelo `google/gemini-3-flash-preview` vía Lovable AI Gateway.
- Observación menor (no bloqueante): el prompt grande de instrucciones está duplicado en cliente y en `generate-flow`, lo que puede generar reglas contradictorias. Se puede simplificar en una iteración posterior si quieres.

## Fuera de alcance

- No se tocan landing/auth ni el sistema de diseño.
- No se cambia el modelo de IA ni el esquema de base de datos.
