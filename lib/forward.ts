/**
 * KFG 국면별 '이후 KOSPI 등락' 분포의 타입.
 * 산출은 pipeline/build_kfg_forward.py, 소비는 components/ForwardView.tsx.
 *
 * 파일시스템에 접근하는 코드는 여기 두지 않는다(lib/data.ts 참조).
 */

export type ForwardStat = {
  n: number;
  median: number;
  mean: number;
  p25: number;
  p75: number;
  min: number;
  max: number;
  /** 해당 구간의 관측 중 이후 등락이 플러스였던 비율(%) */
  positive: number;
};

export type ForwardBucket = {
  /** kfg.json 의 state 값과 같다 */
  state: string;
  /** 그 국면이었던 거래일 수 */
  days: number;
  /** 연속 국면을 하나로 센 수. 겹치는 관측의 실질 표본 크기에 가깝다 */
  episodes: number;
  /** 키는 거래일 수("20" 등) */
  horizons: Record<string, ForwardStat>;
};

export type ForwardData = {
  meta: {
    id: "kfg_forward";
    source_index: string;
    ticker: string;
    first_date: string;
    last_date: string;
    count: number;
    horizons: number[];
  };
  /** 국면을 가리지 않은 전체 기간의 같은 통계. 비교 기준선 */
  baseline: Record<string, { n: number; median: number; positive: number }>;
  buckets: ForwardBucket[];
};

/** 표의 상세 분포는 이 구간 하나만 편다. 네 구간을 다 펼치면 읽히지 않는다. */
export const DETAIL_HORIZON = "60";
