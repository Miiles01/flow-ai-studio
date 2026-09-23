# Videos explicativos en Arquitectura Algorítmica

## Objetivo

Mejorar la experiencia de los esquemas de Descubrimientos con un video explicativo por red, sin recuperar el antiguo carrusel lateral. El esquema seguirá siendo la experiencia principal y el video funcionará como apoyo opcional.

## Experiencia propuesta

1. **Entrada desde el esquema**
   - Cada arquitectura que tenga video mostrará una tarjeta multimedia dentro del propio diagrama.
   - La tarjeta tendrá miniatura en formato 16:9, botón de reproducción centrado, etiqueta `Video` y un título breve.
   - Será visualmente distinta de los pasos del algoritmo para que no parezca otra etapa ni altere la lectura de las conexiones.
   - No tendrá conexiones ni líneas; será un recurso complementario.
   - Si una red todavía no tiene video, la tarjeta no aparecerá. No se mostrará un estado vacío.

2. **Reproductor flotante**
   - Al pulsar la tarjeta, el video se abrirá en una ventana flotante en la esquina inferior derecha, justo encima de `Sugerir ideas`.
   - El reproductor tendrá proporción 16:9, fondo claro u oscuro según el tema y controles visibles de cerrar y ampliar.
   - El video comenzará a reproducirse únicamente después del clic del usuario.
   - Abrir el reproductor no moverá ni reencuadrará el esquema; el usuario podrá seguir consultándolo alrededor del video.
   - Mientras el puntero esté sobre el reproductor, sus clics, desplazamiento y controles no afectarán al esquema.

3. **Vista ampliada**
   - El botón de ampliar abrirá el mismo video sobre el esquema, ocupando casi toda la pantalla y conservando la proporción 16:9.
   - El fondo se atenuará para mantener el foco, con cierre por `X`, tecla Escape o clic fuera.
   - Al volver a la vista pequeña, se conservará el mismo video. Se procurará mantener la reproducción cuando YouTube lo permita sin recargar el iframe.

4. **Convivencia con `Sugerir ideas`**
   - `Sugerir ideas` seguirá fijo abajo a la derecha.
   - Con el reproductor abierto, este se apilará encima con una separación constante; nunca tapará el botón.
   - La ventana de sugerencias tendrá prioridad visual y de interacción si se abre mientras el video está visible.

5. **Móvil**
   - La tarjeta seguirá dentro del esquema y podrá tocarse sin activar el desplazamiento del lienzo.
   - El reproductor pequeño ocupará el ancho disponible sobre la zona inferior, sin cubrir `Sugerir ideas`.
   - La vista ampliada usará prácticamente toda la pantalla y mantendrá accesibles cerrar y controles del video.

## Lógica y estados

- Estado inicial: reproductor cerrado; no se carga YouTube ni se reproduce nada.
- `video cerrado → clic en tarjeta → video flotante reproduciendo`.
- `video flotante → ampliar → video ampliado`.
- `video ampliado → reducir → video flotante`.
- `cualquier vista → cerrar → detener y desmontar el video`.
- Cambiar de red o cerrar Arquitectura Algorítmica también detendrá y cerrará el video.
- Solo habrá un video explicativo activo a la vez.
- Si el enlace es inválido o YouTube no permite insertarlo, se mostrará un mensaje breve dentro del contenedor sin afectar el esquema.

## Datos que recibirá cada arquitectura

Cada red podrá definir opcionalmente:

- URL de YouTube.
- Título corto.
- Miniatura propia opcional; si no llega, se obtiene a partir del identificador de YouTube.
- Texto accesible para el botón de reproducción.
- Posición de la tarjeta dentro del esquema.

Esto permite añadir YouTube, Instagram y las demás redes conforme se entreguen los enlaces, sin duplicar la interfaz.

## Cambios técnicos previstos

- Retirar del visor el estado, lógica y estructura visual del carrusel lateral anterior.
- Extender la definición de cada arquitectura con información opcional del video explicativo.
- Crear una tarjeta multimedia específica para React Flow, sin conectores.
- Crear un único reproductor reutilizable para estado flotante y ampliado.
- Reutilizar y centralizar la conversión segura de enlaces de YouTube en la utilidad de video existente.
- Añadir título y descripción accesibles al visor principal para eliminar las advertencias actuales del cuadro de diálogo.
- Detener propagación de puntero, rueda y teclado en todos los controles superpuestos para evitar que React Flow los capture.

## Criterios de aceptación

- El antiguo panel izquierdo no aparece ni ocupa espacio.
- El esquema conserva su encuadre al abrir y cerrar el video.
- Un clic en la tarjeta reproduce el video correcto de esa red.
- Cerrar detiene el audio y elimina el reproductor.
- Ampliar y reducir funcionan sin que el esquema reciba clics o movimientos accidentales.
- El reproductor no tapa `Sugerir ideas` en escritorio ni móvil.
- Funciona en modo claro y oscuro.
- Las arquitecturas sin video siguen viéndose exactamente como ahora.

## Pendiente de contenido

No se cargarán videos reales todavía. Para cada red faltarán la URL, el título y, si se desea, una miniatura personalizada.