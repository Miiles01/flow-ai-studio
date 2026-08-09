import { supabase } from "@/integrations/supabase/client";

/**
 * Bloque de contexto con las apps que el usuario tiene conectadas y activas,
 * para que la IA sepa que puede apoyarse en ellas cuando el usuario las mencione.
 */
export async function buildAppsContext(): Promise<string> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id;
    if (!userId) return "";

    const { data, error } = await supabase
      .from("user_apps")
      .select("name, connector_type, url, enabled, is_builtin, builtin_key")
      .eq("user_id", userId)
      .eq("enabled", true);

    if (error || !data?.length) return "";

    const custom = data.filter((a) => !a.is_builtin);
    const webSearch = data.some((a) => a.is_builtin && a.builtin_key === "web_search");
    if (!custom.length && !webSearch) return "";

    const list = custom
      .map((a) => `- ${a.name} (${a.connector_type === "mcp" ? "servidor MCP" : "API"}${a.url ? `: ${a.url}` : ""})`)
      .join("\n");

    return `\n\n---
🔌 APPS CONECTADAS POR EL USUARIO (disponibles como herramientas):
${list || "- (ninguna app externa)"}${webSearch ? "\n- Búsqueda en la web" : ""}

REGLAS DE USO DE APPS:
- Usa una app SOLO si el usuario la menciona (por nombre o con un tag tipo "@Nombre") o pide claramente algo que la requiere.
- Un tag "@Nombre" en el prompt significa: apóyate en esa app y explícita en el flujo los pasos/peticiones concretas que harías con ella (endpoints, acciones, datos que obtendrías).
- Si el usuario NO menciona ninguna app, ignora esta sección y genera el flujo normalmente.
- Nunca inventes credenciales ni apps que no estén en esta lista.\n`;
  } catch {
    return "";
  }
}
