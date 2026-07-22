/**
 * 클라이언트·서버 양쪽에서 쓰는 순수 모듈.
 * 파일시스템에 접근하는 코드는 여기 두지 않는다(lib/data.ts 참조).
 */
import type { ComponentKey, StateKey } from "./i18n";

export type HistoryPoint = { d: string; k: number; s: StateKey };

export type Component = {
  key: ComponentKey;
  weight: number;
  score: number | null;
  raw: number | boolean | null;
};

export type KssData = {
  meta: {
    id: string;
    generated_at: string;
    first_date: string;
    last_date: string;
    count: number;
    weights: Record<ComponentKey, number>;
    tickers: { semiconductor: string[]; sox: string; kospi: string };
    percentile: number;
  };
  latest: {
    date: string;
    kss: number;
    state: StateKey;
    components: Component[];
  };
  history: HistoryPoint[];
};

/** 국면별 색 — 과열(적)에서 침체(청)까지. */
export const STATE_COLOR: Record<StateKey, string> = {
  overheated: "#dc2626",
  extended: "#ea580c",
  neutral: "#64748b",
  depressed: "#2563eb",
};

/**
 * 차트용 다운샘플. 6,000점을 그대로 path로 그리면 마크업이 커지므로
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
