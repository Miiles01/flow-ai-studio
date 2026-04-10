

# Plan: Corazón / Like global en postulaciones

## Resumen
Agregar un botón de corazón en cada tarjeta de postulante que funciona como toggle global — cualquier usuario (autenticado o anónimo) puede marcar/desmarcar, y el estado se comparte para todos.

## Cambios

### 1. Base de datos
- Agregar columna `liked boolean default false` a la tabla `user_applications`.
- Crear una función RPC `toggle_applicant_like(p_application_id uuid)` con `SECURITY DEFINER` que haga toggle del campo `liked` y retorne el nuevo valor. Esto permite que usuarios anónimos modifiquen sin necesidad de política UPDATE en `user_applications`.
- Actualizar la función `get_program_applicants_by_token` para incluir el campo `liked` en el resultado.

### 2. Componente ApplicantCard
- Agregar prop `liked: boolean` al tipo `Applicant` y al componente.
- Renderizar un icono `Heart` (lucide) en la esquina superior derecha de la tarjeta.
- Si `liked = true`, el corazón se muestra relleno/rojo. Si `false`, outline.
- Al hacer clic en el corazón (con `e.stopPropagation()` para no abrir el sidebar), llamar a la RPC `toggle_applicant_like` y actualizar el estado local.

### 3. ProgramApplicants (página)
- Pasar el estado `liked` a cada `ApplicantCard`.
- Manejar el callback de toggle para actualizar el array de applicants en el estado.

### 4. ApplicantProfile (sidebar)
- Opcionalmente mostrar el corazón también en el sidebar.

### Archivos a modificar
- **Migración SQL**: nueva columna + RPC + actualizar RPC existente
- `src/components/program/ApplicantCard.tsx`: icono Heart + toggle
- `src/pages/ProgramApplicants.tsx`: estado y callback de like
- `src/components/program/ApplicantProfile.tsx`: agregar `liked` al tipo Applicant

