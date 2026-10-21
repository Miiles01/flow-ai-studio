import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { findSite, siteJson } from "./sites-shared";
import { byteSize, MAX_FILE_BYTES, MAX_FILES_PER_SAVE, validateSiteFile } from "../../userSites";

export default defineTool({
  name: "save_page_files",
  title: "Guardar archivos de mi página",
  description: "Crea (si no existe) y guarda archivos de la página del usuario en Miiles como borrador. Debe incluir index.html. Las imágenes y fuentes van en base64. No publica: usa publish_page después.",
  inputSchema: {
    page_slug: z.string().optional().describe("Vacío u omitido = página principal (wearemiiles.com/usuario). Pro: nombre corto para páginas extra (wearemiiles.com/usuario/nombre)."),
    title: z.string().max(120).optional().describe("Nombre de la página para mostrar en Estudio."),
    template_slug: z.string().max(120).optional().describe("Slug de la plantilla de Estudio usada como base."),
    files: z.array(z.object({
      path: z.string().describe("Ruta relativa, p. ej. index.html, css/style.css, img/foto.jpg."),
      content: z.string().describe("Contenido del archivo: texto para HTML/CSS/JS/SVG, base64 para binarios."),
      encoding: z.enum(["utf8", "base64"]).optional().describe("utf8 (por defecto) o base64."),
    })).min(1).max(MAX_FILES_PER_SAVE).describe("Archivos a guardar o reemplazar (máx. 50 por llamada, 3 MB cada uno)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ page_slug, title, template_slug, files }, ctx) => {
    const rows = files.map((f) => {
      const encoding = f.encoding ?? "utf8";
      let type: string;
      try { type = validateSiteFile(f.path, encoding); } catch (e) { throw new ToolError((e as Error).message); }
      const size = byteSize(f.content, encoding);
      if (size > MAX_FILE_BYTES) throw new ToolError(`${f.path} supera 3 MB`);
      return { file_path: f.path, content: f.content, encoding, content_type: type, size_bytes: size };
    });
    let found;
    try { found = await findSite(ctx, page_slug); } catch (e) { throw e instanceof ToolError ? e : new ToolError((e as Error).message); }
    const { userId, sb, slug } = found;
    let site = found.site;
    if (!site) {
      const { data, error } = await sb.from("user_sites").insert({ owner_id: userId, page_slug: slug, title: title || "Mi página", template_slug: template_slug ?? null }).select("id, title, page_slug, path, status, template_slug, published_at").single();
      if (error) throw new ToolError(error.message);
      site = data;
    } else if (title || template_slug) {
      const { data, error } = await sb.from("user_sites").update({ ...(title ? { title } : {}), ...(template_slug ? { template_slug } : {}) }).eq("id", site.id).select("id, title, page_slug, path, status, template_slug, published_at").single();
      if (error) throw new ToolError(error.message);
      site = data;
    }
    const { error } = await sb.from("user_site_files").upsert(rows.map((r) => ({ ...r, site_id: site!.id, owner_id: userId })), { onConflict: "site_id,file_path" });
    if (error) throw new ToolError(error.message);
    const page = siteJson(site);
    return { content: [{ type: "text", text: `Guardé ${rows.length} archivo(s) en «${page.title}». Estado: ${page.status === "published" ? "publicada (los cambios ya se ven)" : "borrador"}. Para publicar usa publish_page.` }], structuredContent: { page, saved: rows.map((r) => r.file_path) } };
  },
});
