import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { Eye, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { adminFetch } from "@/hooks/useAdminAuth";
import { USER_FLOW, type FlowStep, type UserFlowData } from "@/lib/userFlow";
import { langOf } from "@/i18n";

type Point = { x: number; y: number };
function elbow(a: Point, b: Point) {
  if (Math.abs(a.y - b.y) < 1) return `M${a.x},${a.y} H${b.x}`;
  const mid = (a.x + b.x) / 2;
  const dir = Math.sign(b.y - a.y);
  const r = Math.min(12, Math.abs(b.y - a.y) / 2);
  return `M${a.x},${a.y} H${mid - r} Q${mid},${a.y} ${mid},${a.y + dir * r} V${b.y - dir * r} Q${mid},${b.y} ${mid + r},${b.y} H${b.x}`;
}

export default function UserFlowDiagram({ refreshKey }: { refreshKey: boolean }) {
  const { t, i18n } = useTranslation();
  const text = (key: string) => t(`userflow.${key}`);
  const [days, setDays] = useState<number | null>(30);
  const [data, setData] = useState<UserFlowData | null>(null);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<string, HTMLButtonElement>());
  const group = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<{ d: string; dashed?: boolean }[]>([]);
  const marker = useId().replace(/:/g, "");

  useEffect(() => {
    if (refreshKey) return;
    let cancelled = false;
    setData(null); setError(false);
    adminFetch("admin-customers", { mode: "user_flow", days }).then(({ data: result, error: failure }) => {
      if (cancelled) return;
      if (failure || result?.error || !result?.visits) setError(true);
      else setData(result);
    }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [days, reload, refreshKey]);

  useEffect(() => {
    const root = canvas.current;
    if (!root) return;
    const measure = () => {
      const base = root.getBoundingClientRect();
      const point = (id: string, side: "left" | "right" | "bottom", offset = 0): Point | null => {
        const box = cards.current.get(id)?.getBoundingClientRect();
        if (!box) return null;
        return { x: (side === "left" ? box.left : side === "right" ? box.right : box.left + box.width / 2) - base.left,
          y: (side === "bottom" ? box.bottom : box.top + box.height / 2 + offset) - base.top };
      };
      const connections: [string, string, number, boolean?][] = [
        ["home", "signup", -20], ["affiliates", "signup", 20], ["signup", "onboarding", 0],
        ["onboarding", "dashboard", 0], ["dashboard", "upgrade", 0, true],
      ];
      const next = connections.flatMap(([from, to, offset, dashed]) => {
        const a = point(from, "right"); const b = point(to, "left", offset);
        return a && b ? [{ d: elbow(a, b), dashed }] : [];
      });
      const a = point("dashboard", "bottom"); const target = group.current?.getBoundingClientRect();
      if (a && target) next.push({ d: `M${a.x},${a.y} V${target.top - base.top}`, dashed: false });
      setPaths(next);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    cards.current.forEach((el) => observer.observe(el));
    measure();
    return () => observer.disconnect();
  }, []);

  const number = (n?: number) => data && n !== undefined ? n.toLocaleString(i18n.language) : "—";
  const percent = (n?: number) => data && n !== undefined ? `${n.toLocaleString(i18n.language)}%` : "—";
  const routeFor = (step: FlowStep) => step.id === "home" ? `/${langOf(i18n.language)}` : step.id === "affiliates" ? `/${langOf(i18n.language)}/afiliados` : step.route;
  const info = (step: FlowStep) => (
    <div className="space-y-4">
      <p className="user-flow-route text-sm">{routeFor(step)}</p>
      <h4 className="text-xl font-normal">{text(step.id === "onboarding" ? "progressTitle" : step.title)}</h4>
      <p className="user-flow-secondary text-sm font-light leading-relaxed">{text(`${step.id}Description`)}</p>
      {step.id === "onboarding" ? <>
        <div className="user-flow-completed rounded-lg p-3">
          <p className="text-xs">{text("completed")}</p>
          <p className="text-3xl mt-1 font-normal">{percent(data?.completionRate)}</p>
          <p className="text-xs mt-1">{number(data?.completed)} / {number(data?.registered)}</p>
        </div>
        <div className="space-y-3">{Array.from({ length: 7 }, (_, i) => <div key={i}>
          <div className="flex justify-between gap-3 text-xs mb-1.5"><span>{text(`steps.${i + 1}`)}</span><span>{percent(data?.steps[i])}</span></div>
          <div className="user-flow-track h-1 rounded-full overflow-hidden"><div className="user-flow-fill h-full" style={{ width: `${data?.steps[i] ?? 0}%` }} /></div>
        </div>)}</div>
      </> : <dl className="space-y-3 text-sm font-light">
        <div className="flex justify-between gap-4"><dt>{text("visits")}</dt><dd>{number(data?.visits[step.id] ?? (data ? 0 : undefined))}</dd></div>
        {step.id === "affiliates" && <><div className="flex justify-between gap-4"><dt>{text("popup")}</dt><dd>{number(data?.popup ?? (data ? 0 : undefined))}</dd></div><div className="flex justify-between gap-4"><dt>{text("trials")}</dt><dd>{number(data?.trials)}</dd></div></>}
        <div className="flex justify-between gap-4"><dt>{text("wentSignup")}</dt><dd>{number(step.id === "home" ? data?.homeSignup : data?.affiliatesSignup)}</dd></div>
        {step.id === "home" && <div className="flex justify-between gap-4"><dt>{text("conversion")}</dt><dd>{percent(data?.homeConversion)}</dd></div>}
      </dl>}
    </div>
  );

  return <section className="user-flow" aria-label={text("title")}>
    <div className="px-6 pt-6 flex flex-wrap justify-between items-start gap-4">
      <div><h3 className="text-2xl font-normal">{text("title")}</h3><p className="user-flow-secondary text-sm font-light mt-1">{text("subtitle")}</p></div>
      <div className="flex flex-wrap gap-1" role="group" aria-label={text("period")}>
        {[7, 30, null].map((n) => <Button key={String(n)} variant="ghost" size="sm" aria-pressed={days === n}
          className={`user-flow-filter text-xs rounded-full ${days === n ? "is-active" : ""}`} onClick={() => setDays(n)}>
          {n === null ? text("allTime") : t("userflow.lastDays", { count: n })}
        </Button>)}
      </div>
    </div>
    {error && <div className="px-6 pt-4 flex items-center gap-2 text-sm" role="alert"><span>{text("error")}</span><Button variant="ghost" size="icon" aria-label={text("retry")} onClick={() => setReload((n) => n + 1)}><RefreshCw className="h-4 w-4" /></Button></div>}
    <div className="overflow-x-auto pb-2">
      <div ref={canvas} className="user-flow-canvas relative min-w-[960px] h-[590px]">
        <div className="user-flow-dots absolute inset-0 pointer-events-none" />
        <svg className="user-flow-connectors absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
          <defs><marker id={marker} markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="currentColor" /></marker></defs>
          {paths.map((p, i) => <path key={i} d={p.d} stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray={p.dashed ? "5 5" : undefined} markerEnd={`url(#${marker})`} />)}
        </svg>
        <span className="user-flow-mail absolute left-[352px] top-[136px] flex items-center justify-center w-8 h-8 rounded-md" title={text("accountCreated")}><Mail className="h-4 w-4" /></span>
        <div ref={group} className="user-flow-explore absolute left-[300px] top-[350px] w-[640px] h-[210px] rounded-[24px]">
          <span className="absolute left-5 top-3 text-[13px] font-medium user-flow-secondary">{text("explore")}</span>
        </div>
        {USER_FLOW.map((step) => {
          const Icon = step.icon;
          const card = <Button ref={(el) => { if (el) cards.current.set(step.id, el); else cards.current.delete(step.id); }} variant="ghost"
            className={`user-flow-card tone-${step.tone} absolute h-[112px] w-[112px] rounded-[10px] p-3 block text-left font-normal whitespace-normal`}
            style={{ left: step.x, top: step.y }}
            onFocus={() => step.info && setOpen(step.id)} onBlur={() => setOpen(null)}
            onClick={() => step.info && setOpen((id) => id === step.id ? null : step.id)} aria-label={`${text(step.title)}: ${text("visits")} ${number(data ? data.visits[step.id] ?? 0 : undefined)}`}>
            <span className="block text-[14px] leading-[18px] pr-1">{text(step.title)}</span>
            <span className="block mt-1 text-[11px] opacity-70 font-light">{routeFor(step)}</span>
            <Icon className="h-7 w-7 absolute bottom-3 right-3" />
            <span className="user-flow-counter absolute -top-3 -right-3 min-w-[54px] h-6 rounded-full flex items-center justify-center gap-1.5 px-2 text-[11px]"><Eye className="h-3.5 w-3.5" /><span>{number(data ? data.visits[step.id] ?? 0 : undefined)}</span></span>
          </Button>;
          return step.info ? <HoverCard key={step.id} open={open === step.id} onOpenChange={(v) => setOpen(v ? step.id : null)} openDelay={100} closeDelay={120}>
            <HoverCardTrigger asChild>{card}</HoverCardTrigger>
            <HoverCardPrimitive.Portal><HoverCardContent side="right" align="start" sideOffset={16} collisionPadding={16} className="user-flow user-flow-info w-[304px] rounded-[20px] p-5">{info(step)}</HoverCardContent></HoverCardPrimitive.Portal>
          </HoverCard> : <div key={step.id}>{card}</div>;
        })}
      </div>
    </div>
    <p className="user-flow-secondary text-[11px] font-light px-6 pb-5">{data?.trackedSince ? t("userflow.since", { date: new Date(data.trackedSince).toLocaleDateString(i18n.language) }) : text("newTracking")}</p>
  </section>;
}