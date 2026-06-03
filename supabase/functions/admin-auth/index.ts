const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

async function sign(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return b64url(sig);
}

export async function makeToken(secret: string, hours = 8) {
  const payload = b64url(enc.encode(JSON.stringify({ exp: Date.now() + hours * 3600 * 1000 })));
  return `${payload}.${await sign(payload, secret)}`;
}

export async function verifyToken(token: string | null, secret: string) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = await sign(payload, secret);
  if (expected !== sig) return false;
  try {
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded.exp > Date.now();
  } catch { return false; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");
    if (!ADMIN_PASSWORD) throw new Error("ADMIN_PASSWORD not configured");

    const { mode, password, token } = await req.json();

    if (mode === "verify") {
      const ok = await verifyToken(token ?? null, ADMIN_PASSWORD);
      return new Response(JSON.stringify({ ok }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Contraseña incorrecta" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newToken = await makeToken(ADMIN_PASSWORD);
    return new Response(JSON.stringify({ token: newToken }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
