import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { StudioTemplate } from "@/lib/studio";
import { pageCache } from "@/lib/pageCache";

export function useStudioTemplates() {
  const cached = pageCache.get<StudioTemplate[]>("studio:templates");
  const [templates, setTemplates] = useState<StudioTemplate[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  useEffect(() => {
    supabase
      .from("studio_templates")
      .select("id,slug,title,kind,description,thumbnail_url,html,preview_url,download_url,is_published")
      .order("sort_order")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const list = (data as StudioTemplate[]) ?? [];
        pageCache.set("studio:templates", list);
        setTemplates(list);
        setLoading(false);
      });
  }, []);
  return { templates, loading };
}
