

# Plan: Arreglar embeds de video en Onboarding y Perfil

## Problema
1. **Onboarding** tiene su propia copia local de `getVideoEmbedUrl` (líneas 17-26) que NO incluye soporte para Facebook, Vimeo, ni formatos de URL de compartir (`/share/r/`). No importa la versión centralizada de `src/lib/videoEmbed.ts`.
2. **`src/lib/videoEmbed.ts`** tiene un regex de Facebook que solo detecta URLs con `/videos/`, `/reel/`, o `/watch/` en el path, pero las URLs de compartir de Facebook (`facebook.com/share/r/...`) no coinciden con ese patrón.

## Cambios

### 1. Actualizar `src/lib/videoEmbed.ts`
- Ampliar el regex de Facebook para cubrir también URLs con `/share/` (formato `facebook.com/share/r/...` y `facebook.com/share/v/...`).
- Regex actualizado: `facebook\.com\/(.+\/(videos|reel|watch)|share\/(r|v)\/)`

### 2. Actualizar `src/pages/Onboarding.tsx`
- Eliminar la función local `getVideoEmbedUrl` (líneas 17-26).
- Importar `getVideoEmbedUrl` desde `@/lib/videoEmbed`.

### Archivos a modificar
- `src/lib/videoEmbed.ts` (ampliar regex Facebook)
- `src/pages/Onboarding.tsx` (eliminar duplicado, importar centralizado)

