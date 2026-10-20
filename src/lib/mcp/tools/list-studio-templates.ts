import { defineTool } from "@lovable.dev/mcp-js";
import templates from "../../../data/studio-templates.json";

export default defineTool({
  name: "list_studio_templates",
  title: "Consultar plantillas de Estudio",
  description: "Lista las plantillas disponibles en Miiles Estudio con su identificador y enlaces de vista previa.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({ content: [{ type: "text", text: JSON.stringify(templates.map(({ slug, title, kind, description, preview_url }) => ({ slug, title, kind, description, preview_url }))) }] }),
});