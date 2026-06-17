import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TrendLink = { label: string; url: string };

export type Trend = {
  id: string;
  title: string;
  summary: string | null;
  media_url: string | null;
  media_type: "image" | "video";
  thumbnail_url: string | null;
  links: TrendLink[];
  bullets: string[];
  category: string;
  source: string | null;
  published_at: string;
};

export function useTrends() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("trends")
      .select("*")
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        if (!mounted) return;
        const rows = (data || []).map((t: any) => ({
          ...t,
          links: Array.isArray(t.links) ? t.links : [],
          bullets: Array.isArray(t.bullets) ? t.bullets : [],
        })) as Trend[];
        setTrends(rows);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { trends, loading };
}
