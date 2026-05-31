// 분석 유틸리티 — Streamlit app.py 의 sklearn 로직을 TypeScript 로 이식
// MinMaxScaler, LinearRegression(단변량 최소제곱), K-Means

// ---------- MinMaxScaler ----------
export interface MinMaxScaler {
  min: number[];
  range: number[];
}

export function fitScaler(rows: number[][]): MinMaxScaler {
  const cols = rows[0]?.length ?? 0;
  const min = new Array(cols).fill(Infinity);
  const max = new Array(cols).fill(-Infinity);
  for (const r of rows) {
    for (let c = 0; c < cols; c++) {
      const v = r[c];
      if (v < min[c]) min[c] = v;
      if (v > max[c]) max[c] = v;
    }
  }
  const range = min.map((m, c) => max[c] - m || 1);
  return { min, range };
}

// scaler.transform(rows) * 100
export function normalizeScores(scaler: MinMaxScaler, rows: number[][]): number[][] {
  return rows.map((r) =>
    r.map((v, c) => ((v - scaler.min[c]) / scaler.range[c]) * 100),
  );
}

// ---------- Linear Regression (단변량) ----------
export function predictLR(
  years: number[],
  vals: number[],
  futureYears: number[],
): number[] {
  const pts: [number, number][] = [];
  for (let i = 0; i < years.length; i++) {
    const y = vals[i];
    if (y != null && !Number.isNaN(y)) pts.push([years[i], y]);
  }
  if (pts.length < 2) return futureYears.map(() => NaN);
  const n = pts.length;
  const sx = pts.reduce((a, p) => a + p[0], 0);
  const sy = pts.reduce((a, p) => a + p[1], 0);
  const sxx = pts.reduce((a, p) => a + p[0] * p[0], 0);
  const sxy = pts.reduce((a, p) => a + p[0] * p[1], 0);
  const denom = n * sxx - sx * sx || 1;
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  return futureYears.map((fy) => slope * fy + intercept);
}

// ---------- K-Means (seeded, 결정적) ----------
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dist2(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return s;
}

export function kmeans(
  data: number[][],
  k: number,
  maxIter = 100,
  seed = 42,
): number[] {
  const n = data.length;
  if (n === 0) return [];
  const dim = data[0].length;
  const rng = mulberry32(seed);
  // k-means++ 유사 초기화 (단순 랜덤 선택)
  const chosen = new Set<number>();
  const centroids: number[][] = [];
  while (centroids.length < k && chosen.size < n) {
    const idx = Math.floor(rng() * n);
    if (!chosen.has(idx)) {
      chosen.add(idx);
      centroids.push([...data[idx]]);
    }
  }
  while (centroids.length < k) centroids.push([...data[0]]);

  const labels = new Array(n).fill(0);
  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    for (let i = 0; i < n; i++) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < k; c++) {
        const d = dist2(data[i], centroids[c]);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      if (labels[i] !== best) {
        labels[i] = best;
        changed = true;
      }
    }
    // recompute
    const sums = Array.from({ length: k }, () => new Array(dim).fill(0));
    const counts = new Array(k).fill(0);
    for (let i = 0; i < n; i++) {
      counts[labels[i]]++;
      for (let d = 0; d < dim; d++) sums[labels[i]][d] += data[i][d];
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] > 0)
        for (let d = 0; d < dim; d++) centroids[c][d] = sums[c][d] / counts[c];
    }
    if (!changed && iter > 0) break;
  }
  return labels;
}

// ---------- helpers ----------
export const mean = (arr: number[]): number =>
  arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

export function median(arr: number[]): number {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
