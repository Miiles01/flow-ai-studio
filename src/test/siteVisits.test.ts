import { describe, expect, it } from "vitest";
import { siteVisitSeries } from "@/lib/siteVisits";

describe("published page visits", () => {
  const now = new Date("2026-11-24T18:31:00Z");
  it("counts exactly 30 UTC days, including today, not older or future visits", () => {
    const series = siteVisitSeries([
      { day: "2026-10-25", views: 99 },
      { day: "2026-10-26", views: 2 },
      { day: "2026-11-24", views: 3 },
      { day: "2026-11-25", views: 99 },
    ], now);
    expect(series).toHaveLength(30);
    expect(series[0]).toEqual({ day: "2026-10-26", views: 2 });
    expect(series[29]).toEqual({ day: "2026-11-24", views: 3 });
    expect(series.reduce((total, point) => total + point.views, 0)).toBe(5);
  });
  it("adds visits across the account's pages and fills missing days with zero", () => {
    const series = siteVisitSeries([{ day: "2026-11-24", views: 2 }, { day: "2026-11-24", views: 4 }], now);
    expect(series[29].views).toBe(6);
    expect(series[28].views).toBe(0);
  });
});