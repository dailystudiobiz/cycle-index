/**
 * 이력에서 사이클 구간을 뽑아낸다.
 *
 * 지수 페이지는 "오늘 어디쯤"만 답한다. 이 파일은 그 위의 질문 —
 * "역대 과열·침체 구간은 언제였고 얼마나 오래갔나" — 에 답하는 데 쓴다.
 * 값이 매일 갱신되므로 표를 손으로 관리하지 않고 이력에서 매 빌드 다시 뽑는다.
 *
 * 파일시스템에 접근하지 않는 순수 함수만 둔다(lib/data.ts 참조).
 */

import { INDEX_BANDS, type HistoryPoint, type IndexData, type IndexId } from "./indices";

/** 극단 구간 한 개. */
export type CycleRun = {
  start: string;
  end: string;
  /** 구간에 포함된 거래일 수 */
  days: number;
  /** 구간 안에서 가장 극단적이었던 값과 그 날짜 */
  extreme: number;
  extremeDate: string;
  /** 아직 끝나지 않은 구간(=오늘이 이 구간 안) */
  ongoing: boolean;
  /** 구간 종료 후 중립선(50)을 되돌린 날. 아직이면 null */
  recoveredAt: string | null;
  /** 종료일부터 중립 복귀까지 걸린 거래일. 아직이면 null */
  recoveryDays: number | null;
};

export type CycleSummary = {
  /** 상단 극단 구간(과열·극단적 탐욕) */
  hot: CycleRun[];
  /** 하단 극단 구간(침체·극단적 공포) */
  cold: CycleRun[];
  hotThreshold: number;
  coldThreshold: number;
  allTimeHigh: { value: number; date: string };
  allTimeLow: { value: number; date: string };
  /** 종료된 상단 구간의 중립 복귀 소요일 중앙값 */
  medianRecoveryDays: number | null;
  /** 마지막 하단 구간이 끝난 날 (없으면 null) */
  lastColdEnd: string | null;
  /** 진행 중인 상단 구간 (없으면 null) */
  ongoingHot: CycleRun | null;
};

/** 두 국면을 가르는 기준선. 위/아래 어느 쪽으로 돌아왔는지 판정에 쓴다. */
const MIDLINE = 50;

/**
 * 짧은 이탈은 같은 구간으로 잇는다.
 *
 * 지수가 74.9로 하루 내려갔다 다시 올라간 것을 "구간이 끝났다"로 보면
 * 한 국면이 여러 조각으로 쪼개져 표가 읽히지 않는다. 실제로 2016~2017년
 * 반도체 상승기가 그런 식으로 네 조각이 난다.
 */
const MAX_GAP_DAYS = 10;

/** 이보다 짧은 구간은 노이즈로 보고 버린다. */
const MIN_RUN_DAYS = 15;

function extractRuns(
  history: HistoryPoint[],
  inBand: (k: number) => boolean,
  recovered: (k: number) => boolean,
): CycleRun[] {
  const spans: { from: number; to: number }[] = [];
  let cur: { from: number; to: number } | null = null;
  let gap = 0;

  history.forEach((p, i) => {
    if (inBand(p.k)) {
      if (cur) cur.to = i;
      else cur = { from: i, to: i };
      gap = 0;
      return;
    }
    if (!cur) return;
    gap += 1;
    if (gap > MAX_GAP_DAYS) {
      spans.push(cur);
      cur = null;
      gap = 0;
    }
  });
  if (cur) spans.push(cur);

  const lastIdx = history.length - 1;

  return spans
    .filter(({ from, to }) => to - from + 1 >= MIN_RUN_DAYS)
    .map(({ from, to }) => {
      const slice = history.slice(from, to + 1);
      // 상단 구간이면 최댓값, 하단 구간이면 최솟값이 그 구간을 대표한다.
      const top = inBand(100);
      const peak = slice.reduce((best, p) =>
        top ? (p.k > best.k ? p : best) : (p.k < best.k ? p : best),
      );

      // 중립선을 되돌린 날이 있으면 그 구간은 확실히 끝난 것이다.
      let recoveredAt: string | null = null;
      let recoveryDays: number | null = null;
      for (let i = to + 1; i <= lastIdx; i++) {
        if (recovered(history[i].k)) {
          recoveredAt = history[i].d;
          recoveryDays = i - to;
          break;
        }
      }

      // 오늘까지 이어지는 구간은 "종료"로 적을 수 없다. 마지막 며칠이 밴드를
      // 살짝 벗어났더라도 MAX_GAP_DAYS 안이면 아직 끝나지 않은 것으로 본다.
      //
      // 단 중립선을 이미 넘었다면 이탈 보정과 무관하게 끝난 것이다. 이 조건이
      // 없으면 구간이 끝난 직후 며칠 동안 "아직 중립선까지 내려오지 않았다"고
      // 쓰면서 그 아래 값을 함께 보여주는 모순이 생긴다(2026-07-29 실측).
      const ongoing = recoveredAt === null && lastIdx - to <= MAX_GAP_DAYS;

      return {
        start: history[from].d,
        end: history[to].d,
        days: to - from + 1,
        extreme: peak.k,
        extremeDate: peak.d,
        ongoing,
        recoveredAt,
        recoveryDays,
      };
    });
}

function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

export function summarizeCycles(id: IndexId, data: IndexData): CycleSummary {
  const bands = INDEX_BANDS[id];
  const hotThreshold = bands[bands.length - 1].from;
  const coldThreshold = bands[0].to;
  const h = data.history;

  const hot = extractRuns(
    h,
    (k) => k >= hotThreshold,
    (k) => k < MIDLINE,
  );
  const cold = extractRuns(
    h,
    (k) => k <= coldThreshold,
    (k) => k > MIDLINE,
  );

  const high = h.reduce((best, p) => (p.k > best.k ? p : best));
  const low = h.reduce((best, p) => (p.k < best.k ? p : best));

  return {
    hot,
    cold,
    hotThreshold,
    coldThreshold,
    allTimeHigh: { value: high.k, date: high.d },
    allTimeLow: { value: low.k, date: low.d },
    medianRecoveryDays: median(
      hot.filter((r) => r.recoveryDays !== null).map((r) => r.recoveryDays as number),
    ),
    lastColdEnd: cold.length ? cold[cold.length - 1].end : null,
    ongoingHot: hot.find((r) => r.ongoing) ?? null,
  };
}

/** 길이 기준 순위(1부터). 진행 중인 구간이 역대 몇 번째로 긴지 보여줄 때 쓴다. */
export function rankByDays(runs: CycleRun[], run: CycleRun): number {
  return runs.filter((r) => r.days > run.days).length + 1;
}
