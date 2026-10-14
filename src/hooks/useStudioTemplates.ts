import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { StudioTemplate } from "@/lib/studio";

export function useStudioTemplates() {
  const [templates, setTemplates] = useState<StudioTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase
      .from("studio_templates")
      .select("id,slug,title,kind,description,thumbnail_url,html,preview_url,download_url,is_published")
      .order("sort_order")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTemplates((data as StudioTemplate[]) ?? []);
        setLoading(false);
      });
  }, []);
  return { templates, loading };
}
