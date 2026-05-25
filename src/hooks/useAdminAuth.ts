import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const TOKEN_KEY = "miiles_admin_token";

export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!token) { setValid(false); setChecking(false); return; }
      const { data } = await supabase.functions.invoke("admin-auth", {
        body: { mode: "verify", token },
      });
      if (cancel) return;
      setValid(!!data?.ok);
      setChecking(false);
    })();
    return () => { cancel = true; };
  }, [token]);

  const login = useCallback(async (password: string) => {
    const { data, error } = await supabase.functions.invoke("admin-auth", {
      body: { password },
    });
    if (error || !data?.token) {
      throw new Error(data?.error ?? error?.message ?? "Error de autenticación");
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setValid(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setValid(false);
  }, []);

  return { token, valid, checking, login, logout };
}

export async function adminFetch(fn: string, body: any) {
  const token = localStorage.getItem(TOKEN_KEY);
  return supabase.functions.invoke(fn, {
    body,
    headers: { "x-admin-token": token ?? "" },
  });
}
