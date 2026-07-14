
## Objetivo
Agregar el widget **Ingresos** y crear una capa de datos compartida para que los 4 widgets (Pizarra, Tarjeta de Cliente, Campañas, Ingresos) estén sincronizados dentro del mismo flow.

---

## 1. Nuevo widget: Ingresos

Contenedor grande tipo Campañas/Pizarra con dashboard financiero.

**Header**
- Título "Ingresos" (editable) + subtítulo "Lo que cerraste por mes y lo que está por entrar" (toggleable)
- Filtros: rango Desde / Hasta (mes-año) + botón Resetear

**Fila 1 — KPIs (3 tarjetas)**
- Total cerrado del año actual (+ histórico total)
- Promedio mensual del año
- Mes más alto (con etiqueta del mes)

**Fila 2 — Estado (2 tarjetas grandes coloreadas)**
- Cobrado (verde) — suma de campañas con pagos marcados como cobrados
- Por cobrar (amarillo) — suma pendiente

**Fila 3 — Visualizaciones**
- Bar chart "Total cerrado por mes" (12 meses, recharts) con tooltip
- Donut chart "Top marcas" con leyenda y % (recharts)

**Fila 4 — Lista "Por cobrar"**
- Agrupado por fecha estimada (o "Sin Fecha Estimada")
- Cada fila: nombre campaña/marca → monto → botón Cobrado/Pendiente

**Toolbar**: mismos controles que Campañas (color, título, subtítulo, mover, borrar). Handle superior para arrastrar.

---

## 2. Capa de datos compartida (sincronización)

Crear `src/lib/flowDataContext.tsx` — Context provider a nivel del canvas del flow que expone:

```ts
{
  clients: Client[],           // fuente única de clientes
  campaigns: Campaign[],       // fuente única de campañas
  addClient, updateClient, removeClient,
  addCampaign, updateCampaign, removeCampaign,
  linkClientToCampaign, linkClientToKanbanCard,
  getRevenueStats(range)       // deriva ingresos desde campaigns
}
```

- Persistencia: se serializa junto con `flow.nodes/edges` en Supabase (`flows.data` jsonb o dentro de un nodo "shared_data" oculto).
- Cada widget lee/escribe vía `useFlowData()`.

**Modelos**
- `Client`: id, name, avatar, role, phone, email, tag, assignee, value, customFields
- `Campaign`: id, brandName, clientId?, status, paymentType, totalAmount, installments[], deliverables, exclusivity, notes, paidAt?

---

## 3. Cambios en widgets existentes para conectarlos

**KanbanNode (Pizarra)** — en el editor de tarjeta:
- Renombrar sección "Asignados" → "Equipo"
- Nueva sección "Clientes" debajo: selector con clientes existentes + botón "Crear nuevo cliente" (crea en el pool compartido y aparecerá en tarjetas ClientCard futuras)

**ClientCardNode** — al crear/editar, escribe en el pool compartido `clients[]`. Si el mismo cliente ya está referenciado en una pizarra o campaña, los cambios se reflejan en todos lados.

**CampaignsNode** — en el editor de campaña:
- Nuevo campo "Cliente asignado": selector desde `clients[]` + opción "Crear nuevo cliente"
- Los campos `totalAmount`, `installments`, `paidAt` alimentan directamente los stats del widget Ingresos

**IngresosNode** — solo lee desde `campaigns[]` (y `clients[]` para "Top marcas"). No tiene data propia; es un dashboard derivado.

---

## 4. Registro y wiring
- `src/components/nodes/IngresosNode.tsx` (nuevo)
- `src/components/widgets/registry.ts` — agregar entry `ingresos`
- `src/pages/Index.tsx` — registrar `ingresosNode` en `nodeTypes` y envolver el ReactFlow en `<FlowDataProvider>`
- Persistir el pool compartido junto con el flow (nodes/edges ya se guardan; agregar `sharedData` al save/load)

---

## Detalle técnico
- Charts: `recharts` (ya usado en el proyecto si aplica, si no `bun add recharts`)
- Dark mode: seguir reglas del design-system del proyecto (usar `isDark` + tokens semánticos)
- No conectable con edges (igual que los otros widgets)
- Handle de arrastre superior consistente con los demás

---

## Riesgo / cuidado
- Migración de flows existentes: `sharedData` puede no existir → inicializar vacío al cargar
- Evitar loops de update entre widgets: usar un solo setter por entidad
- El usuario trabaja en paralelo con otra IA vía GitHub: no tocar archivos ajenos al scope

Con tu OK arranco por el context + IngresosNode y luego conecto los 3 widgets existentes.
