export const median = (arr: number[]): number | null => {
  if (!arr.length) return null;
  const a = arr.slice().sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m]! : (a[m - 1]! + a[m]!) / 2;
};

export const mean = (arr: number[]): number | null =>
  arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

export const stdev = (arr: number[]): number | null => {
  if (arr.length < 2) return null;
  const m = mean(arr)!;
  const v = arr.reduce((s, x) => s + (x - m) * (x - m), 0) / (arr.length - 1);
  return Math.sqrt(v);
};

/**
 * 0..1 disagreement score based on temperature spread across sources.
 * <0.5°C spread → ~0 (great agreement). >5°C spread → 1 (very high).
 */
export const disagreementScore = (spread: number): number => {
  if (!Number.isFinite(spread)) return 0;
  const lo = 0.5;
  const hi = 5.0;
  if (spread <= lo) return 0;
  if (spread >= hi) return 1;
  return (spread - lo) / (hi - lo);
};

export const validNums = <T extends Record<string, any>>(rows: T[], key: keyof T): number[] =>
  rows
    .map((r) => r[key] as number | null | undefined)
    .filter((v): v is number => v != null && !Number.isNaN(v));
