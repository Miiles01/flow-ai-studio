import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { findSite, siteJson } from "./sites-shared";

export default defineTool({
  name: "unpublish_page",
  title: "Despublicar mi página",
  description: "Quita de internet la página del usuario (vuelve a borrador). Sus archivos se conservan.",
  inputSchema: { page_slug: z.string().optional().describe("Vacío u omitido = página principal.") },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ page_slug }, ctx) => {
    const { sb, site } = await findSite(ctx, page_slug);
    if (!site) throw new ToolError("Esa página no existe.");
    const { data, error } = await sb.from("user_sites").update({ status: "draft" }).eq("id", site.id).select("id, title, page_slug, path, status, template_slug, published_at").single();
    if (error) throw new ToolError(error.message);
    return { content: [{ type: "text", text: `«${data.title}» ya no está publicada.` }], structuredContent: { page: siteJson(data) } };
  },
});
