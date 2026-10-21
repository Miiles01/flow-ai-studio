import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { findSite, siteJson } from "./sites-shared";

export default defineTool({
  name: "publish_page",
  title: "Publicar mi página",
  description: "Publica la página del usuario en wearemiiles.com y devuelve su enlace. Requiere haber guardado index.html con save_page_files. Confirma con el usuario antes de publicar.",
  inputSchema: { page_slug: z.string().optional().describe("Vacío u omitido = página principal.") },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  handler: async ({ page_slug }, ctx) => {
    const { sb, site } = await findSite(ctx, page_slug);
    if (!site) throw new ToolError("Esa página no existe. Guarda primero sus archivos con save_page_files.");
    const { count } = await sb.from("user_site_files").select("id", { count: "exact", head: true }).eq("site_id", site.id).eq("file_path", "index.html");
    if (!count) throw new ToolError("Falta index.html. Guárdalo con save_page_files antes de publicar.");
    const { data, error } = await sb.from("user_sites").update({ status: "published" }).eq("id", site.id).select("id, title, page_slug, path, status, template_slug, published_at").single();
    if (error) throw new ToolError(error.message);
    const page = siteJson(data);
    return { content: [{ type: "text", text: `Publicada: ${page.url}` }], structuredContent: { page } };
  },
});
