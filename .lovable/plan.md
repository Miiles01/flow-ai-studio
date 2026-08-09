# Filtro de fuentes en el widget de Ingresos

Hoy Ingresos suma las campañas de **todos** los widgets de Campañas del tablero. Vamos a permitir elegir de cuáles widgets toma la información.

## Qué se añade

Un tercer selector, junto a "Desde" y "Hasta", etiquetado **Campañas**:

- Botón con el mismo estilo redondeado de los selectores de mes (mismo contraste sobre fondos claros/oscuros).
- Al hacer clic despliega un dropdown con:
  - Opción "Todos los widgets" (por defecto, comportamiento actual).
  - Lista de cada widget de Campañas del tablero, ordenada alfabéticamente por el nombre del widget, mostrando nombre y subtítulo debajo para identificarlo. Si el widget no tiene nombre propio se muestra "Campañas" y un contador de campañas como apoyo.
- Selección múltiple con casillas: puedes marcar uno o varios widgets.
- La etiqueta del botón resume el estado: "Todos", el nombre del widget elegido, o "N widgets".
- Si un widget seleccionado se elimina del tablero, se ignora automáticamente; si ya no queda ninguno válido, vuelve a comportarse como "Todos".
- El botón "Resetear" existente también limpia esta selección.

Todas las métricas, gráficas y listados de Ingresos (total cerrado, promedio, mes más alto, cobrado / por cobrar) pasan a calcularse solo con las campañas de los widgets seleccionados.

## Detalles técnicos

- `IngresosNodeData` gana `sourceNodeIds?: string[]` (vacío/ausente = todos).
- En `IngresosNode.tsx`, el `useMemo` que recorre `allNodes` filtra por `n.type === "campaignsNode"` y, si hay `sourceNodeIds`, por `sourceNodeIds.includes(n.id)`.
- Nueva lista derivada de fuentes: `{ id, title, subtitle, count }` desde `data.title` / `data.subtitle` de cada `campaignsNode`, ordenada con `localeCompare`.
- Dropdown implementado con el mismo patrón de popover local que `MonthPicker` (estado `sourcesOpen`, cierre mutuo con `fromOpen`/`toOpen`, clases `nodrag`).
- Sin cambios en base de datos ni en `CampaignsNode`.
