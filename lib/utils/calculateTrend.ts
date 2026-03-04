export interface TrendResult {
  percentage: number;
  direction: 'up' | 'down' | 'flat';
}

export function calculateTrend(
  current: number | null | undefined,
  previous: number | null | undefined
): TrendResult {
  const curr = current ?? 0;
  const prev = previous ?? 0;

  if (prev === 0) {
    if (curr === 0) return { percentage: 0, direction: 'flat' };
    return { percentage: 100, direction: 'up' };
  }

  const percentage = ((curr - prev) / prev) * 100;
  const rounded = Math.round(percentage * 10) / 10;

  if (rounded > 0) return { percentage: rounded, direction: 'up' };
  if (rounded < 0) return { percentage: Math.abs(rounded), direction: 'down' };
  return { percentage: 0, direction: 'flat' };
}

export function calculateChartTrend(
  data: Array<{ date: string; count: number }> | null | undefined
): TrendResult {
  if (!data || data.length === 0) return { percentage: 0, direction: 'flat' };
  const mid = Math.floor(data.length / 2);
  const previous = data
    .slice(0, mid)
    .reduce((sum, d) => sum + (d.count ?? 0), 0);
  const current = data.slice(mid).reduce((sum, d) => sum + (d.count ?? 0), 0);
  return calculateTrend(current, previous);
}

/** Transforms raw API chart data into Recharts-compatible shape */
export function transformChartData(
  data: Array<{ date: string; count: number }> | null | undefined
): Array<{ date: string; count: number; label: string }> {
  if (!data || data.length === 0) return [];
  return [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(d => ({
      date: d.date,
      count: d.count ?? 0,
      label: new Date(d.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));
}

/** Filters transformed chart data by day range */
export function filterChartByRange(
  data: Array<{ date: string; count: number; label: string }>,
  days: number | 'ALL'
): Array<{ date: string; count: number; label: string }> {
  if (days === 'ALL' || data.length === 0) return data;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const filtered = data.filter(d => new Date(d.date) >= cutoff);
  return filtered.length > 0 ? filtered : data.slice(-days);
}
