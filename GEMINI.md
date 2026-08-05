# Aprendizajes de UI / UX y Comportamientos Globales

## 1. Portafolio / Páginas Editoriales y Tipografía
- **Consistencia tipográfica con la Landing:** Usar siempre la tipografía corporativa `Manrope` (`font-sans`), respetando los pesos naturales (`font-normal` [400] para títulos y `font-light` [300] para subtítulos y párrafos descriptivos).
- **Prohibido `font-mono` en metadatos editoriales:** Evitar fuentes monoespaciadas en etiquetas como "Industria", "Qué hicimos" o "Sobre el proyecto".
- **Interletrado (Tracking) natural:** Utilizar `tracking-tight` para grandes encabezados y `tracking-normal` o `tracking-widest` para tags/subtítulos. No usar `tracking-tighter` que pegue excesivamente las letras.
- **Contraste de textos clave:** Asegurar que los titulares introductorios tengan contraste sólido (`text-black` / `text-neutral-900`).

## 2. Carga y Transición Progresiva de Imágenes (Fade-In)
- **Eliminar saltos bruscos (snap):** Las imágenes no deben aparecer de golpe cuando el navegador completa su descarga.
- **Doble Fade (Scroll + Load):**
  - **Componente `FadeImage`:** Controla el evento `onLoad` para transicionar de `opacity-0` a `opacity-100` con `transition-opacity duration-1000 ease-out`.
  - **Framer Motion (`whileInView`):** Usa curvas editoriales suaves (`[0.22, 1, 0.36, 1]`) con márgenes de activación moderados (`margin: "-40px"`) y stagger leve entre elementos secundarios.

## 3. Orden Estricto de Proyectos en Portafolio (`/trabajo`)
El orden de los proyectos es inmutable y debe respetarse siempre de arriba a abajo:
1. **Miiles AI** (`miiles`)
2. **Naabi Kanabi** (`naabi-kanabi`)
3. **Tularosa** (`tularosa`)
4. **ERPXtender** (`erpxtender`)
5. **Mar & Vic** (`mar-vic`)
6. **Original — Salon de Barbier** (`original`)
7. **Colorfit** (`colorfit`)
8. **Jambú** (`jambu`)
*Regla:* Nunca alterar o reordenar las claves del objeto `portfolioProjects` en `src/data/portfolioProjects.ts`.

## 4. Voz de Marca (Brand Voice)
- **Siempre en plural corporativo:** Hablar siempre como **Miiles** en primera persona del plural ("Nosotros", "Lideramos", "Diseñamos", "Transformamos"), nunca en primera persona del singular ("Yo", "Mi enfoque").

## 5. Notificaciones y Tooltips Flotantes en Mobile
- **Guiado sutil:** Para indicar acciones táctiles en móvil (ej. "Toca cualquier imagen para ver el detalle"), utilizar un banner flotante fijado al fondo (`fixed bottom-6 inset-x-4 max-w-sm mx-auto`).
- **Diseño:** Contenedor negro/oscuro (`bg-neutral-950/95` + `backdrop-blur-xl`), borde sutil `border-neutral-800`, ícono temático (ej. bombilla ámbar) y botón de cierre manual `✕`.
- **Comportamiento:** Entrada suave desde abajo con delay inicial (~1s), permanencia durante **20 segundos** sincronizado con scroll, y salida automática hacia abajo.

## 6. Transiciones en Modo Oscuro (Dark Mode)
Para imágenes o componentes que cambian drásticamente entre el modo claro y el modo oscuro (ej. tarjetas de redes sociales, ilustraciones complejas):
- **Evitar cambios bruscos (snap):** No cambies el `src` de una etiqueta `<img>` directamente según el tema, ya que produce un corte instantáneo.
- **Usar Cross-fade (Desvanecimiento):** Coloca ambas imágenes (clara y oscura) empalmadas usando `position: absolute;` dentro de un contenedor `relative`. Alterna su opacidad (`opacity-0` a `opacity-100`) usando transiciones CSS (`transition-opacity duration-300`) en base a la variable del tema oscuro (ej. `isDark`). Esto asegura un cambio suave y orgánico.

## 7. Inputs y Paneles con Contenido Extenso
Cuando se espere que un área de texto o un contenedor de AI (prompt bars, paneles de plan/aclaración) reciba contenido largo:
- **Límites de crecimiento:** El contenedor nunca debe "crecer hasta el cielo". Establece un límite máximo de altura (ej. `max-h-[160px]` o un límite según el diseño).
- **Scroll con estilo:** Aplica `overflow-y-auto` y usa siempre un scroll personalizado (ej. la clase `.panel-scrollbar` definida en el CSS global) que se adapte estéticamente tanto en el modo claro como en el modo oscuro.
- **Indicadores de Scroll (Degradados):** Implementa un degradado superpuesto en la parte superior (y/o inferior) que aparezca dinámicamente cuando se detecte scroll. Esto protege el texto para que no sufra recortes visuales duros en los bordes e indica al usuario que hay más contenido oculto.

## 8. Espaciado Dinámico Inicial en Carruseles
En componentes tipo carrusel (scroll horizontal) que requieren alinear su primer elemento con los márgenes del resto de la página:
- Usa un bloque "espaciador" (ej. un `div` con `w-4 md:w-8 lg:w-32` y `shrink-0`) al inicio del contenedor en lugar de aplicar padding directo al contenedor con scroll. Esto garantiza que durante el desplazamiento libre, los elementos fluyan hasta el borde de la pantalla sin cortes antinaturales, manteniendo el margen inicial intacto cuando se vuelve al principio.

## 9. Ámbito de Color y Contraste en Widgets de Canvas (Tableros)
- **Delimitar el color del widget al encabezado exterior:** El color de texto derivado del fondo del widget (`boardTextColor` / `isBoardDark`) debe aplicarse **únicamente** a los títulos, subtítulos, rangos de fechas y controles externos del widget.
- **Tarjetas interiores gobernadas por el tema (`isDark`):** Las sub-tarjetas internas (KPIs, gráficas, listas de pendientes) deben mantener fondos y textos independientes según `isDark` (ej. fondo blanco con texto oscuro en modo claro, fondo `#1C1C1E` con texto blanco en modo oscuro), evitando que fondos personalizados del widget vuelvan invisible el texto interno.
- **Subtítulos y Descripciones nítidas:** Evitar el uso de `opacity-70` o `opacity-75` fijo sobre texto claro en fondos oscuros. Usar `text-white/90` o `color: #FFFFFF` y asegurar placeholders proporcionales (`placeholder:text-white/45` en oscuro y `placeholder:text-black/35` en claro).

## 10. Gráficos Donut / Recharts en Modo Oscuro
- **Eliminar bordes blancos por defecto:** Por defecto, Recharts aplica `stroke="#fff"` a los arcos de `<Pie>` y `<Cell>`. En modo oscuro, siempre pasar explícitamente `stroke={isDark ? "#1C1C1E" : "#FFFFFF"}` tanto a `<Pie>` como a `<Cell>` para que las separaciones coincidan con el color de la superficie de la tarjeta.
- **Contraste en Tooltips:** En `<RTooltip />`, configurar explícitamente `itemStyle={{ color: isDark ? "#FFFFFF" : "#111827" }}` y `labelStyle={{ color: isDark ? "#FFFFFF" : "#111827" }}` además de `contentStyle`, ya que Recharts aplica texto gris oscuro `#333` por defecto si no se especifican.

## 11. Ámbito de Variables en Subcomponentes Hijos
- Al renderizar subcomponentes o tarjetas hijas (ej. `KanbanCard`, `CampaignCard`), nunca referenciar variables computadas del nodo contenedor padre (como `isEffectiveBgDark` o `boardTextColor`) si no forman parte de sus props explícitas. Usar siempre las props locales del componente (`isDark`, `textColor`) para evitar `ReferenceError` en tiempo de ejecución.

## 12. Iconografía y Tooltips Unificados en Barras Flotantes de Widgets (Canvas)
- **Ícono estándar para Color de Fondo:** El botón para cambiar el color de fondo en la barra flotante de herramientas de cualquier widget (`ClientCardNode`, `CampaignsNode`, `KanbanNode`, `TodoNode`, `TextNode`, `IngresosNode`, etc.) debe usar **siempre** el ícono `<Palette />` de `lucide-react` con el tooltip descriptivo `title="Color de fondo"`.
- **Badge / Indicador de color activo:** Debe incluir un punto o badge circular indicador en la esquina inferior derecha (`absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white`) que refleje el color de fondo actual (con línea roja diagonal si es transparente) para dar una referencia visual inmediata al usuario.
- **Prohibido usar íconos dispersos:** Nunca usar `<Square />`, `<PaintBucket />` u otros íconos genéricos para esta acción, garantizando consistencia, affordance y reconocimiento intuitivo en todo el canvas.

