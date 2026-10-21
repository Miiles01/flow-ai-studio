import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { requireUser, siteJson } from "./sites-shared";

export default defineTool({
  name: "list_my_pages",
  title: "Ver mis páginas",
  description: "Lista las páginas del usuario conectado en Miiles, con su estado (borrador o publicada) y su enlace en wearemiiles.com.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    const { userId, sb } = requireUser(ctx);
    const { data, error } = await sb.from("user_sites").select("id, title, page_slug, path, status, template_slug, published_at").eq("owner_id", userId).order("created_at");
    if (error) throw new ToolError(error.message);
    const pages = (data ?? []).map(siteJson);
    return { content: [{ type: "text", text: pages.length ? JSON.stringify(pages) : "Todavía no tienes páginas. Usa save_page_files para crear la primera." }], structuredContent: { pages } };
  },
});
