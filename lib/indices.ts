/**
 * 여러 지표가 공유하는 타입과 표시 규칙.
 * 파일시스템에 접근하는 코드는 여기 두지 않는다(lib/data.ts 참조).
 */

export const INDEX_IDS = ["kss", "kfg"] as const;
export type IndexId = (typeof INDEX_IDS)[number];

/** 지표별 페이지 경로 (언어 접두사 뒤에 붙는 부분) */
export const INDEX_PATH: Record<IndexId, string> = {
  kss: "",
  kfg: "fear-greed/",
};

export type HistoryPoint = { d: string; k: number; s: string };

export type Component = {
  key: string;
  weight: number;
  score: number | null;
  raw: number | boolean | null;
};

export type IndexData = {
  meta: {
    id: IndexId;
    first_date: string;
    last_date: string;
    count: number;
    weights: Record<string, number>;
    tickers: Record<string, string | string[]>;
    percentile: number;
  };
  latest: {
    date: string;
    value: number;
    state: string;
    components: Component[];
  };
  history: HistoryPoint[];
};

/**
 * 국면 색.
 *
 * 두 지표 모두 **높을수록 뜨겁다(적) / 낮을수록 식었다(청)** 로 통일한다.
 * CNN 공포탐욕은 탐욕을 녹색으로 칠하지만, 그러면 '탐욕 = 좋음'으로 읽힌다.
 * 이 사이트는 방향을 예측하지 않고 위치만 재므로, 두 지표에서 같은 높이가
 * 같은 색이 되도록 두는 편이 오해가 적다.
 */
export const STATE_COLOR: Record<string, string> = {
  // KSS
  overheated: "#dc2626",
  extended: "#ea580c",
  neutral: "#64748b",
  depressed: "#2563eb",
  // KFG
  extreme_greed: "#dc2626",
  greed: "#ea580c",
  fear: "#3b82f6",
  extreme_fear: "#2563eb",
};

/** 게이지 위에 그릴 구간 (낮은 값 → 높은 값 순) */
export const INDEX_BANDS: Record<IndexId, { from: number; to: number; key: string }[]> = {
  kss: [
    { from: 0, to: 25, key: "depressed" },
    { from: 25, to: 50, key: "neutral" },
    { from: 50, to: 75, key: "extended" },
    { from: 75, to: 100, key: "overheated" },
  ],
  kfg: [
    { from: 0, to: 25, key: "extreme_fear" },
    { from: 25, to: 45, key: "fear" },
    { from: 45, to: 55, key: "neutral" },
    { from: 55, to: 75, key: "greed" },
    { from: 75, to: 100, key: "extreme_greed" },
  ],
};

/**
 * 차트용 다운샘플. 7,000점을 그대로 path로 그리면 마크업이 커지므로
 * 구간 최대·최소를 살리는 방식으로 줄인다(피크가 뭉개지지 않게).
 */
export function downsample(points: HistoryPoint[], target = 900): HistoryPoint[] {
  if (points.length <= target) return points;
  const bucket = Math.ceil(points.length / (target / 2));
  const out: HistoryPoint[] = [];
  for (let i = 0; i < points.length; i += bucket) {
    const slice = points.slice(i, i + bucket);
    let min = slice[0];
    let max = slice[0];
    for (const p of slice) {
      if (p.k < min.k) min = p;
      if (p.k > max.k) max = p;
    }
    const [a, b] = min.d <= max.d ? [min, max] : [max, min];
    out.push(a);
    if (b !== a) out.push(b);
  }
  const last = points[points.length - 1];
  if (out[out.length - 1].d !== last.d) out.push(last);
  return out;
}

export function sliceRange(points: HistoryPoint[], range: "1y" | "5y" | "all"): HistoryPoint[] {
  if (range === "all") return points;
  const years = range === "1y" ? 1 : 5;
  const cutoff = new Date(points[points.length - 1].d);
  cutoff.setFullYear(cutoff.getFullYear() - years);
  const iso = cutoff.toISOString().slice(0, 10);
  const idx = points.findIndex((p) => p.d >= iso);
  return idx < 0 ? points : points.slice(idx);
}
