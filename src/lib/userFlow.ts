import { Home, Link, UserPlus, LogIn, LayoutDashboard, ArrowUp, Kanban, LayoutTemplate, Network, type LucideIcon } from "lucide-react";
import MiilesStar from "@/components/MiilesStar";
import type { ComponentType } from "react";
import { SUPPORTED_LANGS } from "@/i18n";

export type FlowStep = {
  id: string; title: string; route: string; icon: LucideIcon | ComponentType<{ className?: string }>;
  tone: "black" | "gray" | "blue" | "white"; info?: "home" | "affiliates" | "onboarding" | "login";
  x: number; y: number;
};
export const USER_FLOW: FlowStep[] = [
  { id: "home", title: "home", route: "/es", icon: Home, tone: "black", info: "home", x: 32, y: 32 },
  { id: "affiliates", title: "affiliates", route: "/es/afiliados", icon: Link, tone: "black", info: "affiliates", x: 32, y: 192 },
  { id: "signup", title: "signup", route: "/register", icon: UserPlus, tone: "black", x: 216, y: 96 },
  { id: "login", title: "login", route: "/login", icon: LogIn, tone: "gray", info: "login", x: 216, y: 256 },
  { id: "onboarding", title: "onboarding", route: "/onboarding", icon: MiilesStar, tone: "gray", info: "onboarding", x: 400, y: 96 },
  { id: "dashboard", title: "dashboard", route: "/dashboard", icon: LayoutDashboard, tone: "blue", x: 584, y: 96 },
  { id: "upgrade", title: "upgrade", route: "/precios", icon: ArrowUp, tone: "white", x: 768, y: 96 },
  { id: "boards", title: "boards", route: "/boards", icon: Kanban, tone: "gray", x: 408, y: 456 },
  { id: "studio", title: "studio", route: "/studio", icon: LayoutTemplate, tone: "gray", x: 564, y: 456 },
  { id: "architecture", title: "architecture", route: "/trends", icon: Network, tone: "gray", x: 720, y: 456 },
];
export type UserFlowData = {
  visits: Record<string, number>; people?: Record<string, number>; popup?: number; stepCounts?: number[]; homeSignup: number; affiliatesSignup: number;
  homeConversion: number; trials: number; completed: number; registered: number;
  loginDashboard?: number; loginConversion?: number; logins?: number;
  completionRate: number; steps: number[]; trackedSince: string | null;
};
/** Public language aliases share one metric, while unknown routes are never stored. */
export function flowRoute(path: string): string | null {
  const parts = path.replace(/\/$/, "").split("/").filter(Boolean);
  if ((SUPPORTED_LANGS as readonly string[]).includes(parts[0])) parts.shift();
  const route = "/" + parts.join("/");
  if (route === "/") return "home";
  if (route === "/afiliados") return "affiliates";
  if (route === "/obtener-pro") return "trial";
  const exact = USER_FLOW.find((s) => s.route === route)?.id;
  if (exact) return exact;
  // Opening a board or template inside a section counts as a visit to that Explore section.
  if (/^\/(boards|studio)\//.test(route) && !route.startsWith("/boards/join/")) return route.split("/")[1];
  return null;
}
export function getFlowSession(): string {
  const key = "miiles-flow-session";
  try {
    const stored = JSON.parse(localStorage.getItem(key) || "null");
    const id = stored && Date.now() - stored.at < 30 * 60_000 ? stored.id : crypto.randomUUID();
    localStorage.setItem(key, JSON.stringify({ id, at: Date.now() }));
    return id;
  } catch { return crypto.randomUUID(); }
}