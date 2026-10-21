# Traducción completa ES/EN (rutas /es y /en)

## Qué encontré
- Las rutas `/es/...` y `/en/...` ya existen, y el botón «Idioma» del menú cambia de idioma y de dirección.
- Pero casi todo el texto de **Afiliados, Acerca de, Funciones y Precios** está escrito directo en español, así que al cambiar a inglés no cambia. En Afiliados solo se traducen las tarjetas de «¿Qué vas a crear?».
- Las direcciones sin idioma (`/afiliados`, `/precios`…) muestran la página, pero el idioma no queda claro.
- El panel (dashboard) traduce muy poco: casi todo está fijo en español.

## Fase 1 — Páginas públicas (prioridad)
1. **Afiliados (primero y con más cuidado):** pasar todos los textos (títulos, beneficios, comisiones, pasos, preguntas frecuentes, botones, formularios, mensajes) a los archivos de idioma, con un inglés natural y de marketing, no traducción literal.
2. **Inicio, Acerca de, Funciones, Precios, Precios Negocios y Gracias, Términos, Privacidad, Agentes/Servicios, Clínicas, Conecta tu IA:** lo mismo.
3. **Menú y pie de página:** revisar que todos los enlaces mantengan el idioma actual, que el idioma activo se marque bien y que al cambiar te quedes en la misma página.
4. **Direcciones sin idioma:** `/afiliados` → `/es/afiliados` (y así con todas), para que siempre exista una versión clara en cada idioma. `/conecta-tu-ia` se agrega también con `/en`.
5. **Buscadores:** título y descripción de cada página en su idioma, y la etiqueta de idioma de la página (`lang="en"`) actualizada.
6. **Recordar el idioma:** si alguien eligió inglés, al entrar a `/` lo manda a `/en/`.

## Fase 2 — Panel (dashboard)
- El panel no usa `/es` ni `/en` en la dirección (son páginas privadas); el idioma se elige en **Ajustes rápidos / Perfil** y se recuerda.
- Traducir menú lateral, Inicio, Tableros, Estudio (incluye Mis páginas y Usar esta plantilla), Programas, Perfil, Buscador, ventanas de Compartir/Pro/Afiliados y avisos.
- Los widgets dentro de los tableros quedan para una ronda posterior (son muchísimos); te los listo al final.

## Verificación
- Recorrer cada página en `/es` y `/en` con el navegador automático, buscando textos que se queden en español, y probar el botón Idioma desde varias páginas.
- Una prueba automática que confirme que el archivo en inglés y el español tienen exactamente las mismas claves (para que nunca falte una traducción).

## Detalles técnicos
- Textos en `src/locales/es.json` y `en.json`, organizados por página (`affiliates.*`, `about.*`, `features.*`, `pricing.*`, `dashboard.*`…).
- Redirección de rutas sin prefijo con un componente que antepone el idioma guardado en localStorage (por defecto `es`); las rutas privadas no se tocan.
- `LanguageLayout` sincroniza `document.documentElement.lang`; `usePageSeo` recibe textos traducidos.
- Antes de editar se revisa el estado de GitHub (hay un cambio local pendiente en el conector que no se toca).
- Es un trabajo grande: se entrega Fase 1 completa primero, con Afiliados al frente.
