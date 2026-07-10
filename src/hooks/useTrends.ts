import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_TRENDS } from "@/data/mockTrends";

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
    // Fallback to mock data since endpoints are down
    setTimeout(() => {
      if (!mounted) return;
      setTrends(MOCK_TRENDS);
      setLoading(false);
    }, 500);

    return () => {
      mounted = false;
    };
  }, []);

  return { trends, loading };
}
