import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ConnectorType = "mcp" | "api";

export type UserApp = {
  id: string;
  name: string;
  connector_type: ConnectorType;
  url: string | null;
  /** Never fetched to the client; keys stay write-only. */
  has_api_key?: boolean;
  enabled: boolean;
  is_builtin: boolean;
  builtin_key: string | null;
};

export type NewUserApp = {
  name: string;
  connector_type: ConnectorType;
  url?: string | null;
  api_key?: string | null;
};

export const WEB_SEARCH_KEY = "web_search";

export function useUserApps() {
  const { user } = useAuth();
  const [apps, setApps] = useState<UserApp[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setApps([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("user_apps")
      .select("id, name, connector_type, url, enabled, is_builtin, builtin_key")
      .eq("user_id", user.id)
      .order("is_builtin", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading user apps:", error);
      setApps([]);
    } else {
      setApps((data ?? []) as UserApp[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const webSearchRow = apps.find((a) => a.is_builtin && a.builtin_key === WEB_SEARCH_KEY);
  const webSearchEnabled = webSearchRow ? webSearchRow.enabled : true;
  const customApps = apps.filter((a) => !a.is_builtin);

  const createApp = useCallback(
    async (app: NewUserApp) => {
      if (!user) return;
      const { error } = await supabase.from("user_apps").insert({
        user_id: user.id,
        name: app.name,
        connector_type: app.connector_type,
        url: app.url ?? null,
        api_key: app.api_key ?? null,
        enabled: true,
        is_builtin: false,
      });
      if (error) {
        console.error("Error creating app:", error);
        throw error;
      }
      await load();
    },
    [user, load]
  );

  const toggleApp = useCallback(
    async (id: string, enabled: boolean) => {
      if (!user) return;
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, enabled } : a)));
      const { error } = await supabase
        .from("user_apps")
        .update({ enabled })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) {
        console.error("Error toggling app:", error);
        await load();
      }
    },
    [user, load]
  );

  const toggleWebSearch = useCallback(
    async (enabled: boolean) => {
      if (!user) return;
      if (webSearchRow) {
        await toggleApp(webSearchRow.id, enabled);
        return;
      }
      const { error } = await supabase.from("user_apps").insert({
        user_id: user.id,
        name: "Búsqueda en la web",
        connector_type: "api",
        enabled,
        is_builtin: true,
        builtin_key: WEB_SEARCH_KEY,
      });
      if (error) {
        console.error("Error setting web search:", error);
        return;
      }
      await load();
    },
    [user, webSearchRow, toggleApp, load]
  );

  const deleteApp = useCallback(
    async (id: string) => {
      if (!user) return;
      setApps((prev) => prev.filter((a) => a.id !== id));
      const { error } = await supabase
        .from("user_apps")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) {
        console.error("Error deleting app:", error);
        await load();
      }
    },
    [user, load]
  );

  return {
    loading,
    customApps,
    webSearchEnabled,
    createApp,
    toggleApp,
    toggleWebSearch,
    deleteApp,
    reload: load,
  };
}
