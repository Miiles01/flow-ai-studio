# Aprendizajes de UI / UX y Comportamientos Globales

## Transiciones en Modo Oscuro (Dark Mode)
Para imágenes o componentes que cambian drásticamente entre el modo claro y el modo oscuro (ej. tarjetas de redes sociales, ilustraciones complejas):
- **Evitar cambios bruscos (snap):** No cambies el `src` de una etiqueta `<img>` directamente según el tema, ya que produce un corte instantáneo.
- **Usar Cross-fade (Desvanecimiento):** Coloca ambas imágenes (clara y oscura) empalmadas usando `position: absolute;` dentro de un contenedor `relative`. Alterna su opacidad (`opacity-0` a `opacity-100`) usando transiciones CSS (`transition-opacity duration-300`) en base a la variable del tema oscuro (ej. `isDark`). Esto asegura un cambio suave y orgánico.

## Inputs y Paneles con Contenido Extenso
Cuando se espere que un área de texto o un contenedor de AI (prompt bars, paneles de plan/aclaración) reciba contenido largo:
- **Límites de crecimiento:** El contenedor nunca debe "crecer hasta el cielo". Establece un límite máximo de altura (ej. `max-h-[160px]` o un límite según el diseño).
- **Scroll con estilo:** Aplica `overflow-y-auto` y usa siempre un scroll personalizado (ej. la clase `.panel-scrollbar` definida en el CSS global) que se adapte estéticamente tanto en el modo claro como en el modo oscuro.
- **Indicadores de Scroll (Degradados):** Implementa un degradado superpuesto en la parte superior (y/o inferior) que aparezca dinámicamente cuando se detecte scroll. Esto protege el texto para que no sufra recortes visuales duros en los bordes e indica al usuario que hay más contenido oculto. (Excepción: estos degradados de scroll suelen omitirse en resoluciones `mobile` si el espacio es muy limitado).

## Espaciado Dinámico Inicial en Carruseles
En componentes tipo carrusel (scroll horizontal) que requieren alinear su primer elemento con los márgenes del resto de la página:
- Usa un bloque "espaciador" (ej. un `div` con `w-4 md:w-8 lg:w-32` y `shrink-0`) al inicio del contenedor en lugar de aplicar padding directo al contenedor con scroll. Esto garantiza que durante el desplazamiento libre, los elementos fluyan hasta el borde de la pantalla sin cortes antinaturales, manteniendo el margen inicial intacto cuando se vuelve al principio.
