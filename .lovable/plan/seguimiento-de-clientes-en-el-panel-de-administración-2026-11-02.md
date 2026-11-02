# Seguimiento de clientes en el panel de administración

## Paréntesis: pagos
La activación de pagos reales está completa (cuenta real conectada y lista). Hoy solo hay 1 suscripción registrada y es de prueba (cancelada). La vista previa siempre cobra en modo prueba; la app publicada (miiles.app) cobra de verdad. Como parte del trabajo: confirmar que la app publicada usa el modo real y mostrar en el panel qué suscripciones son reales vs. de prueba.

## Nueva pestaña "Clientes" en el panel de administración

**Resumen arriba (tarjetas):**
- Usuarios registrados totales y nuevos (últimos 7 / 30 días)
- Completaron onboarding
- Con al menos un tablero
- Con plan Pro (real) / Free
- Intentaron comprar (clic en "Empezar Pro" o "Contactar")
- Visitaron Arquitectura algorítmica

**Tabla por usuario** (buscable, ordenable, filtros: nuevos, sin onboarding, con intento de compra):
nombre, correo, fecha de registro, onboarding sí/no, nº de tableros, nº de widgets, nº de páginas creadas con plantillas, plan, vio Arquitectura (sí/no + redes vistas: TikTok, Instagram, Facebook, YouTube), interacción con precios (clics en cards, "Empezar Pro", "Contactar"), última actividad.

**Ranking de plantillas más vistas:** vistas y usos de "Usar esta plantilla" por plantilla, excluyendo siempre la actividad de contmanuel77@gmail.com.

## Qué se mide desde ahora
Los conteos de tableros, widgets, páginas y planes salen de datos que ya existen (incluye historial). Lo nuevo — vistas de Arquitectura y redes, clics en precios, vistas de plantillas — se empieza a registrar a partir de este cambio; no hay historial previo.

## Detalles técnicos
- Tabla `user_events` (user_id, event, props jsonb, created_at): insert solo propio (`auth.uid()`), sin lectura para usuarios; GRANT insert a authenticated, all a service_role. Eventos: `architecture_view {network}`, `pricing_card_click {plan}`, `pricing_cta {pro|contact}`, `template_view {template_number}`, `template_use`.
- Helper `trackEvent()` en cliente, sin bloquear UI; llamado en ArchitecturePage (cambio de red), PricingTable/UpgradeProDialog, StudioTemplate/UseTemplateDialog. En páginas públicas sin sesión se ignora (solo usuarios registrados).
- Edge Function `admin-customers` validada con la sesión admin firmada existente: agrega con service_role profiles + auth.users (email, created_at, last_sign_in) + flows (conteo de nodos tipo widget en `nodes`) + user_sites + subscriptions (env live/sandbox) + user_events; excluye el usuario admin del ranking de plantillas.
- Componente `AdminCustomers.tsx` como nueva pestaña en `Admin.tsx`.
