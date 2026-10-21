import { ToolError, type ToolContext } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";
import { normalizePageSlug, publicSiteUrl } from "../../userSites";

export function requireUser(ctx: ToolContext) {
  const userId = ctx.getUserId();
  if (!ctx.isAuthenticated() || !userId) throw new ToolError("Conecta tu cuenta de Miiles para usar esta herramienta.");
  return { userId, sb: supabaseForUser(ctx) };
}

export async function findSite(ctx: ToolContext, pageSlug?: string) {
  const { userId, sb } = requireUser(ctx);
  const slug = normalizePageSlug(pageSlug);
  const { data, error } = await sb.from("user_sites").select("id, title, page_slug, path, status, template_slug, published_at").eq("owner_id", userId).eq("page_slug", slug).maybeSingle();
  if (error) throw new ToolError(error.message);
  return { userId, sb, slug, site: data };
}

export function siteJson(site: { id: string; title: string; page_slug: string; path: string; status: string; template_slug: string | null; published_at: string | null }) {
  return { id: site.id, title: site.title, page_slug: site.page_slug, status: site.status, template_slug: site.template_slug, published_at: site.published_at, url: publicSiteUrl(site.path) };
}
