import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAILS = ["contmanuel77@gmail.com"];
const WIDGET_TYPES = new Set([
  "campaignsNode", "kanbanNode", "ingresosNode", "todoNode", "clientCardNode",
  "contractsNode", "collabFinderNode",
]);

const enc = new TextEncoder();
async function verifyToken(token: string | null, secret: string) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  let s = ""; for (const b of bytes) s += String.fromCharCode(b);
  const expected = btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  if (expected !== sig) return false;
  try {
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))).exp > Date.now();
  } catch { return false; }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function fetchAll(sb: any, table: string, cols: string) {
  const out: any[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from(table).select(cols).range(from, from + 999);
    if (error) throw error;
    out.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!(await verifyToken(req.headers.get("x-admin-token"), Deno.env.get("ADMIN_PASSWORD")!))) {
      return json({ error: "Unauthorized" }, 401);
    }
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const authUsers: any[] = [];
    for (let page = 1; ; page++) {
      const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      authUsers.push(...data.users);
      if (data.users.length < 1000) break;
    }
    const body = await req.json();
    if (body.mode === "user_flow") {
      const days = body.days === null ? null : Number(body.days ?? 30);
      if (days !== null && ![7, 30].includes(days)) return json({ error: "Invalid range" }, 400);
      const excluded = authUsers.filter((u) => ADMIN_EMAILS.includes((u.email ?? "").toLowerCase())).map((u) => u.id);
      const { data, error } = await sb.rpc("admin_user_flow_stats", { p_days: days, p_excluded: excluded });
      if (error) throw error;
      // Stage counters also use what each customer already did, so history before page tracking still shows.
      const since = days === null ? "" : new Date(Date.now() - days * 864e5).toISOString();
      const ex = new Set(excluded);
      const inRange = (t?: string | null) => !!t && t >= since;
      const [profiles, flows, events, apps] = await Promise.all([
        fetchAll(sb, "profiles", "user_id, onboarding_completed"),
        fetchAll(sb, "flows", "user_id, created_at, updated_at"),
        fetchAll(sb, "user_events", "user_id, event, created_at"),
        fetchAll(sb, "user_applications", "user_id, created_at").catch(() => []),
      ]);
      const users = authUsers.filter((u) => !ex.has(u.id));
      const ids = new Set(users.map((u) => u.id));
      const uniq = (list: any[]) => new Set(list.filter((r) => ids.has(r.user_id)).map((r) => r.user_id)).size;
      const evUsers = (names: string[]) => uniq(events.filter((e) => names.includes(e.event) && inRange(e.created_at)));
      const onboarded = new Set(profiles.filter((p) => p.onboarding_completed).map((p) => p.user_id));
      const signedUp = users.filter((u) => inRange(u.created_at));
      // Only real, current customers count as claimed Pro months (deleted test accounts are left out).
      const trials = await fetchAll(sb, "pro_trials", "user_id, started_at");
      data.trials = uniq(trials.filter((t) => inRange(t.started_at)));
      let pq = sb.from("user_flow_events").select("session_id, user_id").eq("route", "trial_popup");
      if (since) pq = pq.gte("created_at", since);
      const { data: pops, error: popError } = await pq.limit(10000);
      if (popError) throw popError;
      data.popup = new Set((pops ?? []).filter((r: any) => !ex.has(r.user_id)).map((r: any) => r.session_id)).size;
      // Onboarding progress per new account: furthest tracked screen, or all 7 when they finished before tracking existed.
      const { data: obEv, error: obErr } = await sb.from("user_flow_events").select("user_id, step").eq("route", "onboarding").not("step", "is", null).limit(10000);
      if (obErr) throw obErr;
      const furthest = new Map<string, number>();
      for (const e of obEv ?? []) if (e.user_id) furthest.set(e.user_id, Math.max(furthest.get(e.user_id) ?? 0, e.step));
      const cohort = users.filter((u) => inRange(u.created_at));
      const reach = cohort.map((u) => onboarded.has(u.id) ? 7 : furthest.get(u.id) ?? 0);
      data.steps = [1, 2, 3, 4, 5, 6, 7].map((n) => cohort.length ? Math.round(1000 * reach.filter((r) => r >= n).length / cohort.length) / 10 : 0);
      data.stepCounts = [1, 2, 3, 4, 5, 6, 7].map((n) => reach.filter((r) => r >= n).length);
      data.people = {
        signup: signedUp.length,
        onboarding: signedUp.filter((u) => onboarded.has(u.id)).length,
        dashboard: users.filter((u) => inRange(u.last_sign_in_at)).length,
        boards: uniq(flows.filter((f) => inRange(f.updated_at ?? f.created_at))),
        programs: uniq(apps.filter((a) => inRange(a.created_at))),
        studio: evUsers(["template_view", "template_use"]),
        architecture: evUsers(["architecture_view"]),
        upgrade: evUsers(["pricing_card_click", "pricing_cta"]),
      };
      return json(data);
    }
    const [profiles, flows, sites, subs, events, proTrials] = await Promise.all([
      fetchAll(sb, "profiles", "user_id, display_name, username, onboarding_completed"),
      fetchAll(sb, "flows", "user_id, nodes, updated_at"),
      fetchAll(sb, "user_sites", "owner_id, template_slug, status"),
      fetchAll(sb, "subscriptions", "user_id, status, environment, current_period_end, price_id"),
      fetchAll(sb, "user_events", "user_id, event, props, created_at"),
      fetchAll(sb, "pro_trials", "user_id, expires_at"),
    ]);
    const activeTrial = new Set(proTrials.filter((t) => Date.parse(t.expires_at) > Date.now()).map((t) => t.user_id));

    const adminIds = new Set(authUsers.filter((u) => ADMIN_EMAILS.includes((u.email ?? "").toLowerCase())).map((u) => u.id));
    const profBy = new Map(profiles.map((p) => [p.user_id, p]));
    const now = Date.now();

    const rows = authUsers.map((u) => {
      const p = profBy.get(u.id) ?? {};
      const myFlows = flows.filter((f) => f.user_id === u.id);
      const widgets = myFlows.reduce((n, f) => n + (Array.isArray(f.nodes) ? f.nodes.filter((x: any) => WIDGET_TYPES.has(x?.type)).length : 0), 0);
      const mySites = sites.filter((s) => s.owner_id === u.id);
      const mySubs = subs.filter((s) => s.user_id === u.id);
      const activeSub = mySubs.find((s) =>
        (["active", "trialing"].includes(s.status) && (!s.current_period_end || Date.parse(s.current_period_end) > now)) ||
        (s.status === "canceled" && s.current_period_end && Date.parse(s.current_period_end) > now));
      const ev = events.filter((e) => e.user_id === u.id);
      const networks = [...new Set(ev.filter((e) => e.event === "architecture_view").map((e) => e.props?.network).filter(Boolean))];
      const lastEvent = ev.reduce((m, e) => (e.created_at > m ? e.created_at : m), "");
      const lastFlow = myFlows.reduce((m, f) => (f.updated_at > m ? f.updated_at : m), "");
      return {
        id: u.id,
        email: u.email,
        name: p.display_name ?? null,
        username: p.username ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        last_activity: [u.last_sign_in_at ?? "", lastEvent, lastFlow].sort().pop() || null,
        onboarding: !!p.onboarding_completed,
        boards: myFlows.length,
        widgets,
        pages: mySites.length,
        published_pages: mySites.filter((s) => s.status === "published").length,
        plan: activeSub ? (activeSub.environment === "live" ? "pro" : "pro_test") : activeTrial.has(u.id) ? "pro_trial" : "free",
        architecture_views: ev.filter((e) => e.event === "architecture_view").length,
        networks,
        pricing_card_clicks: ev.filter((e) => e.event === "pricing_card_click").length,
        pro_clicks: ev.filter((e) => e.event === "pricing_cta" && e.props?.cta === "pro").length,
        contact_clicks: ev.filter((e) => e.event === "pricing_cta" && e.props?.cta === "contact").length,
        template_views: ev.filter((e) => e.event === "template_view").length,
        template_uses: ev.filter((e) => e.event === "template_use").length,
        is_admin: adminIds.has(u.id),
      };
    }).sort((a, b) => b.created_at.localeCompare(a.created_at));

    const tpl = new Map<string, { slug: string; title: string; views: number; uses: number; pages: number }>();
    const getTpl = (slug: string, title?: string) => {
      if (!tpl.has(slug)) tpl.set(slug, { slug, title: title ?? slug, views: 0, uses: 0, pages: 0 });
      const t = tpl.get(slug)!; if (title) t.title = title; return t;
    };
    for (const e of events) {
      if (adminIds.has(e.user_id) || !e.props?.slug) continue;
      if (e.event === "template_view") getTpl(e.props.slug, e.props.title).views++;
      if (e.event === "template_use") getTpl(e.props.slug, e.props.title).uses++;
    }
    for (const s of sites) if (s.template_slug && !adminIds.has(s.owner_id)) getTpl(s.template_slug).pages++;

    const d = (days: number) => new Date(now - days * 864e5).toISOString();
    const customers = rows.filter((r) => !r.is_admin);
    const summary = {
      total: customers.length,
      new7: customers.filter((r) => r.created_at >= d(7)).length,
      new30: customers.filter((r) => r.created_at >= d(30)).length,
      onboarding: customers.filter((r) => r.onboarding).length,
      withBoards: customers.filter((r) => r.boards > 0).length,
      pro: customers.filter((r) => r.plan === "pro").length,
      proTest: customers.filter((r) => r.plan === "pro_test").length,
      proTrial: customers.filter((r) => r.plan === "pro_trial").length,
      buyIntent: customers.filter((r) => r.pro_clicks + r.contact_clicks > 0).length,
      architecture: customers.filter((r) => r.architecture_views > 0).length,
      withPages: customers.filter((r) => r.pages > 0).length,
      liveSubscriptions: subs.filter((s) => s.environment === "live").length,
      testSubscriptions: subs.filter((s) => s.environment !== "live").length,
    };

    return json({ summary, users: rows, templates: [...tpl.values()].sort((a, b) => b.views - a.views || b.uses - a.uses) });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Error" }, 500);
  }
});
