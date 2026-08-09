# Arreglar el cursor y los tags de apps en el input de IA

## Problema

Hoy el input dibuja los tags con un "overlay espejo": el texto real del `textarea` se vuelve transparente y encima se pinta una capa con píldoras (logo + nombre + X). Como la píldora ocupa más ancho que el texto `@App` que hay debajo, todo se desincroniza:

- El cursor aparece en una posición que no coincide con lo que ves.
- Al hacer clic sobre la píldora, el clic va al `textarea` (o a un botón que ya no está donde se ve), así que la X no quita el tag.
- Editar en medio de la frase se siente "roto" porque la capa visual y el texto real no miden lo mismo.

## Solución

Dejar de deformar el texto. El `textarea` vuelve a ser texto normal y visible, y el resaltado del tag no cambia el ancho de los caracteres.

1. **Resaltado sin cambio de ancho**: `@App` se sigue viendo dentro de la frase, pero con un fondo tipo píldora sutil (blanco al 12-15%, esquinas redondeadas) que se pinta detrás del texto real, respetando exactamente la misma tipografía, tamaño y espaciado. El texto deja de ser transparente, así que el cursor y la selección siempre están donde deben.
2. **Sin botones dentro del texto**: se quita la X y el logo incrustados en la frase (eran los causantes de los clics perdidos).
3. **Fila de chips debajo del input**: los tags detectados se listan como chips con logo, nombre y X para quitarlos. Ahí sí se puede hacer clic sin pelear con el cursor. Quitar un chip borra su `@App` del texto y deja el cursor al final.
4. **Escritura fluida**: al insertar una sugerencia se conserva el comportamiento actual (inserta `@Nombre ` y coloca el cursor después), y se corrige la detección de menciones para que no se dispare a mitad de una palabra ya escrita.
5. **Dark/light**: chips y resaltado usan los mismos tonos que el resto de la barra negra (fondo `white/10`, hover `white/15`, borde `white/10`).

## Detalle técnico

Archivo único: `src/components/AIPromptBar.tsx`.

- El overlay pasa a ser una capa de *fondo* (`z-0`) sincronizada por scroll, con el mismo `font`, `line-height`, `padding`, `text-align` y `white-space` que el `textarea`; los segmentos de mención se envuelven en un `<span>` con fondo redondeado y `box-decoration-break: clone`, sin `inline-flex`, sin iconos ni `padding` horizontal que altere el ancho (usar `box-shadow` lateral o `padding` compensado con margen negativo).
- `textarea` recupera `text-white` (se elimina `text-transparent caret-white`).
- Nueva fila de chips renderizada bajo el textarea, alimentada por los `segments` que tienen `app`; la X reutiliza `removeMention(index, length)`.
- Se conservan `mentionRegex`, `segments`, `insertMention` y el panel de sugerencias tal como están.
