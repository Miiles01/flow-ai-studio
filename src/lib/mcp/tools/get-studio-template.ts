import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import templates from "../../../data/studio-templates.json";

export default defineTool({
  name: "get_studio_template",
  title: "Obtener una plantilla de Estudio",
  description: "Obtiene información y enlaces de una plantilla del catálogo; no crea ni publica páginas de usuario.",
  inputSchema: { slug: z.string().min(1).max(120).describe("Identificador de una plantilla devuelto por list_studio_templates.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ slug }) => {
    const template = templates.find((item) => item.slug === slug);
    if (!template) throw new ToolError("No encontramos esa plantilla en Estudio.");
    return { content: [{ type: "text", text: JSON.stringify({ ...template, capabilities: { read_template: true, create_page: false, edit_page: false, publish_page: false } }) }] };
  },
});