export const SITE_VISIT_DAYS = 30;
export type SiteVisitPoint = { day: string; views: number };

/** UTC calendar days match the dates stored by record_site_view. */
export function siteVisitSeries(rows: SiteVisitPoint[], now = new Date()): SiteVisitPoint[] {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const totals = new Map<string, number>();
  for (const row of rows) totals.set(row.day, (totals.get(row.day) ?? 0) + row.views);
  return Array.from({ length: SITE_VISIT_DAYS }, (_, i) => {
    const day = new Date(today - (SITE_VISIT_DAYS - 1 - i) * 86400000).toISOString().slice(0, 10);
    return { day, views: totals.get(day) ?? 0 };
  });
}