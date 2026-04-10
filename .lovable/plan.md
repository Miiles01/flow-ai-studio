

# Plan: Link corto y página pública para detalle de programa

## Problema
1. El link de compartir usa UUID largo (`/programs/9b59d827-d7ab-420a-a792-108ced0dab6e`) — difícil de compartir.
2. Usuarios no autenticados son redirigidos al login al intentar ver la página (probablemente porque el Supabase client sin sesión no tiene el rol `anon` configurado correctamente, o hay un problema con la query).

## Solución

### 1. Slug corto para programas
- Agregar columna `slug` (text, unique) a `brand_programs` via migración.
- Poblar slugs desde `brand_name` existentes (ej: "Glossier" → "glossier").
- Crear ruta `/p/:slug` que renderiza ProgramDetail buscando por slug.
- El botón "Compartir" copiará la URL corta `/p/glossier` en vez del UUID.
- Mantener la ruta `/programs/:id` existente para compatibilidad interna.

### 2. Asegurar acceso público
- La ruta `/programs/:id` ya NO está envuelta en `ProtectedRoute`, pero el componente usa `useAuth` que puede causar problemas si `loading` bloquea el render. Ajustar ProgramDetail para no depender de que auth termine de cargar antes de mostrar el contenido del programa.
- Cargar datos del programa inmediatamente sin esperar auth. Solo las funciones de postulación requieren usuario.
- La RLS de `brand_programs` ya permite SELECT para `anon`, así que la query debería funcionar sin sesión.

### 3. Archivos a modificar
- **Migración SQL**: Agregar `slug` a `brand_programs`, poblar valores, agregar unique constraint.
- **`src/App.tsx`**: Agregar ruta `/p/:slug`.
- **`src/pages/ProgramDetail.tsx`**: Aceptar tanto `id` como `slug`, separar fetch de programa del fetch de auth/admin, copiar URL corta.

### Detalles técnicos

```sql
ALTER TABLE brand_programs ADD COLUMN slug text UNIQUE;
UPDATE brand_programs SET slug = lower(regexp_replace(brand_name, '[^a-zA-Z0-9]', '-', 'g'));
```

En ProgramDetail:
- Detectar si el param es UUID o slug
- Buscar por `id` o por `slug` según corresponda
- El `useEffect` para datos del programa no dependerá de `user`
- Un segundo `useEffect` para admin/application status sí dependerá de `user`

