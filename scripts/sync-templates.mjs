import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const templatesDir = path.join(__dirname, "../src/data/flow-templates");

async function syncTemplates() {
  const files = fs.readdirSync(templatesDir).filter((f) => f.endsWith(".json"));
  const templates = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(templatesDir, file), "utf-8");
    const json = JSON.parse(content);
    templates.push({
      ...json,
      slug: json.slug || file.replace(".json", ""),
    });
  }

  const rows = templates.map((t) => ({
    slug: String(t.slug),
    title: String(t.title ?? t.slug),
    description: String(t.description ?? ""),
    tags: Array.isArray(t.tags) ? t.tags : [],
    nodes: t.nodes ?? [],
    edges: t.edges ?? [],
    prompt_hint: String(t.prompt_hint ?? ""),
  }));

  console.log(`Sincronizando ${rows.length} plantillas a Supabase...`);

  const { error } = await supabase.from("flow_templates").upsert(rows, { onConflict: "slug" });
  
  if (error) {
    console.error("Error al sincronizar:", error);
    process.exit(1);
  }

  console.log("¡Sincronización exitosa!");
}

syncTemplates();
