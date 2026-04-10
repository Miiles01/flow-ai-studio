

# Plan: Postulaciones pública + perfil en sidebar lateral

## Cambios

### 1. Página de Postulaciones accesible públicamente
- Quitar `<ProtectedRoute>` del wrapper de `/programs/:id/applicants` en `App.tsx` — dejarlo como ruta pública igual que `PublicApplicants`.
- Modificar `ProgramApplicants.tsx`: eliminar la verificación de admin y el check de `useAuth` para cargar datos. Usar la misma RPC `get_program_applicants_by_token` o hacer la query directamente (los datos del programa ya son públicos vía RLS).
- Eliminar el botón "Volver al programa".

### 2. Perfil del postulante en sidebar lateral (no popup)
- Reemplazar el `Dialog` en `ApplicantProfile.tsx` por un `Sheet` (de shadcn) que se abre desde la derecha.
- El Sheet mostrará el perfil completo: avatar, nombre, niche, bio, redes sociales, portafolio de videos, fecha de postulación.
- **Excluir** el número de teléfono del panel visible.
- Aplicar el mismo cambio en `PublicApplicants.tsx` (ya usa el mismo componente `ApplicantProfile`).

### Archivos a modificar
- **`src/App.tsx`**: Quitar `ProtectedRoute` de la ruta `/programs/:id/applicants`.
- **`src/pages/ProgramApplicants.tsx`**: Eliminar check de admin, eliminar botón "Volver al programa", cargar datos sin depender de auth.
- **`src/components/program/ApplicantProfile.tsx`**: Cambiar `Dialog` → `Sheet` (side="right"), ocultar teléfono.

### Detalle técnico
- El `Sheet` usará `side="right"` con ancho ~400px, scroll interno, y el mismo contenido visual actual (avatar, bio, socials sin phone, videos, fecha).
- La página cargará applicants usando la query directa a `user_applications` + `profiles` con el `program_id` del param (RLS permite SELECT anon en `brand_programs`, pero `user_applications` y `profiles` no tienen policy para anon). Para resolver esto, reutilizaremos el `public_token` del programa y la RPC `get_program_applicants_by_token` — la página obtendrá primero el `public_token` del programa (query pública a `brand_programs`) y luego llamará la RPC.

