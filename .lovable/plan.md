# Programa de Afiliados

Cualquier usuario puede compartir su link `miiles.app/?ref=suusuario`. Quien llegue por ese link y compre un plan queda registrado como referido de quien lo invitó, para hacer las transferencias de comisiones por fuera.

## 1. Nombre de usuario (`username`)

- Nuevo campo `username` en la tabla de perfiles, único e insensible a mayúsculas.
- A los perfiles ya existentes se les genera un username aleatorio (ej. `manuel_a3f9`) para que su link funcione de inmediato; luego lo pueden editar.
- Editable en dos lugares:
  - **Onboarding**: un paso/campo nuevo para elegir nombre de usuario (con validación de disponibilidad).
  - **Perfil → ajustes**: campo para cambiarlo cuando quieran.
- Validación: solo letras, números, guion y guion bajo; entre 3 y 30 caracteres; debe estar libre.

## 2. Card en el sidebar (arriba del perfil)

- En `DashboardLayout`, justo encima de la card de perfil, se añade una card (blanca en claro / negra en oscuro siguiendo el sistema de diseño).
- Contenido: icono de regalo + texto "Únete al programa de afiliados" y subtítulo "Comparte tu link y recibe comisiones".
- Al hacer clic abre el popup de afiliados. En estado colapsado del sidebar se muestra solo el icono de regalo.

## 3. Popup de afiliados

- Muestra el username del usuario ya cargado (sin tener que escribir nada).
- Botón **"Generar link"** que arma `https://miiles.app/?ref=usuario` y permite copiarlo.
- Si el usuario aún no tiene username (caso raro), se le pide crear uno ahí mismo antes de generar.
- Abajo, un mini resumen: "X personas usaron tu link · Y compraron un plan".

## 4. Tracking del referido

- Cuando alguien entra a la app con `?ref=usuario`, se guarda ese username en `localStorage` (referrer pendiente), si la URL trae un ref válido.
- El link manda al visitante al **login/registro**.
- Al crear cuenta (registro normal o Google), si hay un referrer pendiente y no es uno mismo, se registra la relación referido→referidor una sola vez y se limpia el pendiente.
- Cuando el referido compra un plan, se marca esa relación como "convertida" (compró), para el conteo de comisiones.

## 5. Detalle técnico

### Base de datos (migración)
- `profiles.username TEXT UNIQUE` (con índice único case-insensitive). Backfill de usernames aleatorios para perfiles existentes.
- Nueva tabla `referrals`:
  - `referrer_id` (quién invitó), `referred_id` (quién se registró, único), `referred_at`, `purchased` (bool), `purchased_at`.
  - GRANTs estándar + RLS: el referidor puede leer sus propias filas; inserciones vía función `SECURITY DEFINER`.
- Función `register_referral(p_username text)`: resuelve el username al `referrer_id`, valida que no sea el propio usuario y crea la fila si no existe.
- Función `get_referral_stats()`: devuelve total de referidos y total con `purchased = true` del usuario actual (para el popup).
- Función `mark_referral_purchased(p_user_id uuid)`: marca `purchased = true` para el referido.

### Frontend
- `Register.tsx` y el login con Google: leer `?ref=` / `localStorage` y llamar `register_referral` tras el alta.
- App raíz: capturar `?ref=` al cargar y guardarlo en `localStorage`.
- Nuevo componente `AffiliatePopup` (Popover/Dialog) usado desde la card del sidebar.
- Perfil y Onboarding: campo de username con verificación de disponibilidad.

### Atribución de la compra
- En `payments-webhook`, cuando una suscripción pasa a activa, llamar a `mark_referral_purchased(userId)` para marcar la relación del comprador (si fue referido).

## Notas
- El link usa `?ref=` para evitar choques con rutas reales (login, precios, perfil, etc.).
- Por ahora solo se guarda la relación referido→referidor y si compró; los pagos de comisión se gestionan por fuera.
