

# Plan: Estadísticas, Postulaciones Públicas y Avatar

## Resumen
Reorganizar la sección de estadísticas en el detalle del programa, crear un sistema de postulaciones visible para admins con link público compartible, y habilitar subida de foto de perfil.

---

## 1. Reorganizar ProgramDetail.tsx
- Mover `EarningsCalculator` debajo de los badges (14% / belleza), no arriba del banner
- Renombrar título interno de "Proyección de ganancias" a "Estadísticas"

## 2. Subida de avatar (foto de perfil)
- **Migración**: Crear bucket de storage `avatars` (público)
- **RLS en storage**: Usuarios autenticados pueden subir/actualizar su propio avatar
- **Onboarding**: Agregar paso o sección para subir foto
- **Profile.tsx**: Agregar upload de avatar con preview
- Optimizar imagen en frontend antes de subir (resize a max 400x400, compresión)
- Guardar URL en `profiles.avatar_url`

## 3. Sistema de postulaciones para admin
- **Migración**: Agregar columna `public_token` (uuid, unique) a `brand_programs` para el link público compartible
- **Nueva página `ProgramApplicants.tsx`**: 
  - Ruta: `/programs/:id/applicants` (protegida, solo admin)
  - Muestra cards de cada persona postulada con: avatar, nombre, redes sociales
  - Click en card abre perfil completo (bio, videos, teléfono, portafolio)
  - Botón para copiar link público
- **Nueva página `PublicApplicants.tsx`**:
  - Ruta: `/applicants/:token` (pública, sin auth)
  - Misma vista de cards pero accesible con el token
  - No requiere login

## 4. RLS y seguridad
- `user_applications`: Agregar policy SELECT para admins (pueden ver todas las postulaciones)
- `profiles`: Agregar policy SELECT para admins (pueden ver perfiles de postulantes)
- Crear función SQL para acceso público por token (security definer)

## 5. Notificación al admin
- Cuando alguien se postula, insertar registro en `notifications` para todos los admins del sistema

---

## Detalle técnico

### Base de datos (migraciones)
```sql
-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage RLS
CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own avatar" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public avatar read" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

-- Public token for shareable link
ALTER TABLE brand_programs ADD COLUMN public_token uuid DEFAULT gen_random_uuid() UNIQUE;

-- Admin can view all applications
CREATE POLICY "Admins can view all applications" ON user_applications FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Function for public access by token
CREATE FUNCTION get_program_applicants_by_token(p_token uuid)
RETURNS TABLE(...) SECURITY DEFINER ...
```

### Nuevos archivos
- `src/pages/ProgramApplicants.tsx` — vista admin
- `src/pages/PublicApplicants.tsx` — vista pública por token
- `src/components/program/ApplicantCard.tsx` — card reutilizable
- `src/components/program/ApplicantProfile.tsx` — perfil completo en dialog

### Archivos modificados
- `src/App.tsx` — nuevas rutas
- `src/pages/ProgramDetail.tsx` — reordenar secciones, link a postulaciones para admin
- `src/components/program/EarningsCalculator.tsx` — renombrar título
- `src/pages/Profile.tsx` — upload avatar
- `src/pages/Onboarding.tsx` — upload avatar
- `src/pages/ProgramDetail.tsx` — al postularse, crear notificación para admins

