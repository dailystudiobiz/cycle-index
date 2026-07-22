export const LANGS = ["ko", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "ko";

export type StateKey = "overheated" | "extended" | "neutral" | "depressed";
export type ComponentKey =
  | "semi_dev200"
  | "sox_dev200"
  | "semi_dd52"
  | "semi_ma50"
  | "kospi_dev200";

type Dict = {
  siteName: string;
  tagline: string;
  metaDescription: string;
  nav: { index: string; methodology: string; faq: string };
  today: string;
  asOf: string;
  scoreLabel: string;
  percentile: (p: number) => string;
  percentileHelp: string;
  states: Record<StateKey, { label: string; band: string; meaning: string }>;
  componentsHeading: string;
  bandsHeading: string;
  componentsIntro: string;
  components: Record<ComponentKey, { label: string; weight: string; what: string }>;
  colScore: string;
  colWeight: string;
  colRaw: string;
  above50: { yes: string; no: string };
  historyHeading: string;
  historyIntro: (from: string, to: string, n: number) => string;
  rangeLabels: Record<string, string>;
  methodology: {
    heading: string;
    intro: string[];
    formulaHeading: string;
    formulaIntro: string;
    mappingHeading: string;
    mappings: { title: string; body: string }[];
    dataHeading: string;
    dataBody: string[];
    limitsHeading: string;
    limits: string[];
  };
  faq: { heading: string; items: { q: string; a: string }[] };
  disclaimer: string;
  disclaimerShort: string;
  footerUpdated: string;
  langSwitch: string;
};

const ko: Dict = {
  siteName: "반도체 사이클 지수",
  tagline: "삼성전자·SK하이닉스·SOX·KOSPI를 합성한 0~100 과열도 지표",
  metaDescription:
    "한국 반도체 사이클 스코어(KSS). 삼성전자·SK하이닉스의 200일선 이격과 52주 낙폭, 필라델피아 반도체지수(SOX), KOSPI를 가중 합성해 0~100으로 나타낸 과열도 지표. 2000년부터의 전체 이력과 계산 방법을 공개합니다.",
  nav: { index: "지수", methodology: "계산 방법", faq: "자주 묻는 질문" },
  today: "오늘의 지수",
  asOf: "기준일",
  scoreLabel: "KSS",
  percentile: (p) => `2000년 이후 상위 ${(100 - p).toFixed(1)}% 수준`,
  percentileHelp:
    "전체 이력에서 오늘보다 낮은 값이 차지하는 비율입니다. 100에 가까울수록 역사적으로 드문 과열 구간입니다.",
  states: {
    overheated: {
      label: "과열",
      band: "75 이상",
      meaning:
        "가격이 장기 추세선에서 크게 벌어져 있는 구간입니다. 과거 이 구간에서는 추세가 이어진 사례와 급격히 되돌린 사례가 모두 있었습니다.",
    },
    extended: {
      label: "상승 연장",
      band: "50 ~ 75",
      meaning:
        "추세선 위에 있으나 극단은 아닌 구간입니다. 상승이 이어지는 국면에서 가장 오래 머무르는 구간이기도 합니다.",
    },
    neutral: {
      label: "중립",
      band: "25 ~ 50",
      meaning:
        "가격이 장기 추세선 근처에 있는 구간입니다. 이 지표만으로는 방향성을 읽기 어렵습니다.",
    },
    depressed: {
      label: "침체 / 과대낙폭",
      band: "25 미만",
      meaning:
        "고점 대비 낙폭이 크고 추세선 아래에 있는 구간입니다. 바닥 부근에서 나타나기도 하지만, 하락이 더 이어지는 동안에도 계속 낮게 유지될 수 있습니다.",
    },
  },
  componentsHeading: "구성 지표",
  bandsHeading: "국면 구분",
  componentsIntro:
    "다섯 개 지표를 각각 0~100으로 변환한 뒤 가중평균합니다. 모든 지표는 100에 가까울수록 과열을 뜻합니다. 값을 구하지 못한 지표가 있으면 그 지표를 빼고 남은 가중치를 다시 100%로 환산합니다.",
  components: {
    semi_dev200: {
      label: "삼성전자·SK하이닉스 200일선 이격",
      weight: "30%",
      what:
        "두 종목의 현재가가 각각의 200일 이동평균에서 몇 % 떨어져 있는지를 구해 평균한 값입니다. 장기 추세 대비 현재 위치를 재는 가장 직접적인 척도라 비중을 가장 크게 두었습니다.",
    },
    sox_dev200: {
      label: "SOX(필라델피아 반도체지수) 200일선 이격",
      weight: "20%",
      what:
        "글로벌 반도체 업황을 대표하는 지수의 추세 대비 위치입니다. 한국 반도체 주가가 SOX를 따라가는 경향이 있어 별도 지표로 넣었습니다.",
    },
    semi_dd52: {
      label: "삼성전자·SK하이닉스 52주 고점 대비 낙폭",
      weight: "20%",
      what:
        "최근 52주 최고가에서 얼마나 내려와 있는지입니다. 낙폭이 클수록 과열도를 낮추는 방향으로 작용해, 이격도만 볼 때 생기는 쏠림을 완충합니다.",
    },
    semi_ma50: {
      label: "50일선 위/아래",
      weight: "15%",
      what:
        "두 종목의 과반이 50일 이동평균 위에 있는지를 봅니다. 단기 모멘텀을 나타내는 항목으로, 위면 70점 아래면 30점만 부여하는 이진 지표입니다.",
    },
    kospi_dev200: {
      label: "KOSPI 200일선 이격",
      weight: "15%",
      what:
        "시장 전체의 과열도입니다. 반도체만의 문제인지 국내 증시 전반의 흐름인지를 구분하기 위해 넣었습니다.",
    },
  },
  colScore: "점수",
  colWeight: "가중치",
  colRaw: "원값",
  above50: { yes: "위", no: "아래" },
  historyHeading: "전체 이력",
  historyIntro: (from, to, n) =>
    `${from}부터 ${to}까지 ${n.toLocaleString("ko-KR")}거래일을 같은 산식으로 소급 계산했습니다. 지표를 만든 날부터가 아니라 데이터가 존재하는 전 기간을 계산했기 때문에, 지금 값이 과거 사이클에서 어디쯤인지 바로 비교할 수 있습니다.`,
  rangeLabels: { "1y": "1년", "5y": "5년", all: "전체" },
  methodology: {
    heading: "계산 방법",
    intro: [
      "반도체 사이클 지수(KSS, Korea Semiconductor Score)는 한국 반도체 관련 주가가 자신의 장기 추세에서 얼마나 벌어져 있는지를 0에서 100 사이의 한 숫자로 나타낸 지표입니다. 100에 가까울수록 추세 대비 높이 올라와 있고, 0에 가까울수록 크게 내려와 있다는 뜻입니다.",
      "이 지표는 가격과 추세만으로 계산합니다. 실적이나 메모리 고정거래가, 재고 수준 같은 펀더멘털 데이터는 들어가 있지 않습니다. 따라서 KSS는 '지금 시장이 이 업종을 어떻게 평가하고 있는가'를 요약한 것이지, '반도체 업황이 좋은가 나쁜가'를 판정한 것이 아닙니다.",
      "계산에 쓰는 모든 산식과 가중치를 아래에 전부 공개합니다. 같은 데이터로 같은 값을 재현할 수 있도록 하기 위해서입니다.",
    ],
    formulaHeading: "구성과 가중치",
    formulaIntro:
      "다섯 개 항목을 각각 0~100 점수로 바꾼 뒤 아래 가중치로 평균합니다. 어떤 항목의 값을 구하지 못하면 그 항목을 제외하고 남은 가중치의 합으로 나누어 다시 100% 기준으로 환산합니다.",
    mappingHeading: "점수 변환 규칙",
    mappings: [
      {
        title: "200일선 이격 → 점수",
        body:
          "이격도가 0%일 때 50점을 주고, +40%면 100점, -40%면 0점이 되도록 선형 변환합니다. 범위를 벗어나면 0 또는 100에서 자릅니다. KOSPI만 변동폭이 작아 기준을 ±30%로 좁게 잡았습니다.",
      },
      {
        title: "52주 낙폭 → 점수",
        body:
          "고점에 있을 때(0%) 100점, -30%면 40점, -50% 이하면 0점입니다. 낙폭이 커질수록 점수가 내려가므로 과열도를 낮추는 방향으로 작용합니다.",
      },
      {
        title: "50일선 위/아래 → 점수",
        body:
          "두 종목의 과반이 50일선 위에 있으면 70점, 그렇지 않으면 30점입니다. 중간값이 없는 이진 지표이므로 가중치를 15%로 제한했습니다.",
      },
    ],
    dataHeading: "데이터와 갱신",
    dataBody: [
      "가격 데이터는 삼성전자(005930.KS), SK하이닉스(000660.KS), 필라델피아 반도체지수(^SOX), KOSPI(^KS11)의 일별 종가를 사용합니다. 배당·액면분할이 반영된 수정주가 기준입니다.",
      "이동평균과 52주 고점은 각 종목이 실제로 거래된 날만으로 계산합니다. 한국과 미국의 휴장일이 다르기 때문에, 공통 달력에 먼저 맞추고 평균을 내면 값이 왜곡됩니다. 각자의 거래일에서 지표를 먼저 구한 뒤 KOSPI 거래일 기준으로 정렬합니다.",
      "지수는 한국 증시 종가 확정 후 하루 한 번 갱신합니다. SOX는 미국 시장이 한국보다 늦게 마감하므로, 특정 날짜의 KSS에는 같은 날짜의 SOX 종가가 반영됩니다. 실시간 지표가 아니라 종가 기준 일별 지표입니다.",
    ],
    limitsHeading: "이 지표의 한계",
    limits: [
      "펀더멘털이 빠져 있습니다. DRAM·NAND 고정거래가, 재고, 설비투자 같은 업황 데이터가 들어가지 않습니다. 사이클의 바닥과 하락 초입은 가격만으로 구분되지 않습니다.",
      "두 종목에 의존합니다. 삼성전자와 SK하이닉스만 보므로, 소재·장비·후공정 업체의 흐름이 다를 때는 반영되지 않습니다.",
      "가중치는 설계자가 정한 값입니다. 통계적으로 최적화한 것이 아니라 각 항목의 성격을 고려해 배분한 것입니다. 다른 가중치를 쓰면 다른 값이 나옵니다.",
      "높은 값이 하락을 예고하지 않습니다. 과거 이력에서 높은 구간이 오래 유지된 경우도, 곧바로 되돌린 경우도 모두 있습니다. 이 지표는 예측이 아니라 현재 위치의 측정입니다.",
      "공식 지수가 아닙니다. 거래소나 지수 사업자가 산출하는 지수가 아니며, 어떤 금융상품의 기초자산도 아닙니다.",
    ],
  },
  faq: {
    heading: "자주 묻는 질문",
    items: [
      {
        q: "KSS가 높으면 팔아야 하나요?",
        a: "아닙니다. 이 지표는 매매 신호가 아닙니다. 값이 높다는 것은 가격이 장기 추세선에서 위로 많이 벌어져 있다는 사실을 나타낼 뿐이며, 그 상태가 얼마나 이어질지는 알려주지 않습니다. 전체 이력을 보면 높은 구간이 수개월 유지된 시기도 있습니다.",
      },
      {
        q: "CNN 공포탐욕지수와 무엇이 다른가요?",
        a: "대상과 구성이 다릅니다. CNN 지수는 미국 증시 전반의 투자심리를 옵션·채권·변동성 등으로 측정합니다. KSS는 한국 반도체 업종에 한정해, 가격이 자신의 장기 추세에서 얼마나 벌어져 있는지만 봅니다. 심리 지표라기보다 위치 지표에 가깝습니다.",
      },
      {
        q: "왜 2000년부터인가요?",
        a: "200일 이동평균을 계산하려면 최소 200거래일의 가격이 필요하고, 네 시계열이 모두 확보되는 시점이 2000년 하반기입니다. 그 이전 구간은 지표 중 일부를 계산할 수 없어 제외했습니다.",
      },
      {
        q: "값이 다른 곳과 조금씩 다릅니다.",
        a: "계산 시점 때문일 수 있습니다. 장중이나 개장 전에 계산하면 전 거래일 종가가 쓰입니다. 이 사이트는 한국 증시 종가가 확정된 뒤에 계산한 값만 게시합니다.",
      },
      {
        q: "데이터를 받아볼 수 있나요?",
        a: "전체 이력을 JSON으로 내려받을 수 있습니다. 출처를 밝히면 자유롭게 인용해도 됩니다.",
      },
    ],
  },
  disclaimer:
    "이 사이트는 정보 제공을 목적으로 하며 투자 권유나 자문이 아닙니다. 게시된 지수는 공개된 가격 데이터를 정해진 산식으로 가공한 참고 지표로, 특정 종목의 매수·매도를 권유하지 않으며 수익을 보장하지 않습니다. 투자 판단과 그 결과에 대한 책임은 투자자 본인에게 있습니다. 데이터에 오류나 지연이 있을 수 있습니다.",
  disclaimerShort: "투자 권유가 아닌 참고 지표입니다. 투자 판단의 책임은 본인에게 있습니다.",
  footerUpdated: "최종 갱신",
  langSwitch: "English",
};

const en: Dict = {
  siteName: "Korea Semiconductor Cycle Index",
  tagline: "A 0–100 froth gauge built from Samsung, SK hynix, SOX and KOSPI",
  metaDescription:
    "Korea Semiconductor Score (KSS): a 0–100 index combining the 200-day moving-average deviation and 52-week drawdown of Samsung Electronics and SK hynix with the Philadelphia Semiconductor Index (SOX) and KOSPI. Full history since 2000 and the complete formula are published.",
  nav: { index: "Index", methodology: "Methodology", faq: "FAQ" },
  today: "Today's reading",
  asOf: "As of",
  scoreLabel: "KSS",
  percentile: (p) => `Top ${(100 - p).toFixed(1)}% of readings since 2000`,
  percentileHelp:
    "The share of the full history that sits below today's value. Closer to 100 means a historically rare, stretched reading.",
  states: {
    overheated: {
      label: "Overheated",
      band: "75 and above",
      meaning:
        "Prices sit far above their long-term trend. Historically this band has both persisted for months and reversed sharply — it does not resolve in one direction.",
    },
    extended: {
      label: "Extended",
      band: "50 – 75",
      meaning:
        "Above trend but not at an extreme. This is where the index spends most of its time during an advance.",
    },
    neutral: {
      label: "Neutral",
      band: "25 – 50",
      meaning:
        "Prices are near their long-term trend. The index carries little information about direction in this band.",
    },
    depressed: {
      label: "Depressed / deep drawdown",
      band: "Below 25",
      meaning:
        "A large drawdown from the 52-week high with prices below trend. This band has appeared near lows, but it can also stay low while a decline continues.",
    },
  },
  componentsHeading: "Components",
  bandsHeading: "Reading bands",
  componentsIntro:
    "Five inputs are each mapped to a 0–100 score and then averaged with the weights below. Higher always means more stretched. If an input cannot be computed, it is dropped and the remaining weights are rescaled to 100%.",
  components: {
    semi_dev200: {
      label: "Samsung & SK hynix — 200-day MA deviation",
      weight: "30%",
      what:
        "How far each stock trades from its own 200-day moving average, averaged across the two. This is the most direct measure of position versus long-term trend, so it carries the largest weight.",
    },
    sox_dev200: {
      label: "SOX (Philadelphia Semiconductor Index) — 200-day MA deviation",
      weight: "20%",
      what:
        "The global semiconductor benchmark relative to its own trend. Korean semiconductor equities tend to track SOX, so it enters as a separate input.",
    },
    semi_dd52: {
      label: "Samsung & SK hynix — drawdown from 52-week high",
      weight: "20%",
      what:
        "How far the two stocks have fallen from their 52-week highs. A deeper drawdown pushes the index down, which dampens the pull of the deviation terms alone.",
    },
    semi_ma50: {
      label: "Above or below the 50-day MA",
      weight: "15%",
      what:
        "Whether a majority of the two stocks trade above their 50-day moving average. A short-term momentum flag scored 70 if above and 30 if below — binary, so its weight is capped.",
    },
    kospi_dev200: {
      label: "KOSPI — 200-day MA deviation",
      weight: "15%",
      what:
        "The broad Korean market versus its own trend, included to separate a semiconductor-specific move from a market-wide one.",
    },
  },
  colScore: "Score",
  colWeight: "Weight",
  colRaw: "Raw",
  above50: { yes: "Above", no: "Below" },
  historyHeading: "Full history",
  historyIntro: (from, to, n) =>
    `${n.toLocaleString("en-US")} trading days from ${from} to ${to}, recomputed with the same formula throughout. Because the history is backfilled across the entire available price record rather than starting the day the index launched, today's reading can be compared directly against past cycles.`,
  rangeLabels: { "1y": "1Y", "5y": "5Y", all: "All" },
  methodology: {
    heading: "Methodology",
    intro: [
      "The Korea Semiconductor Score (KSS) expresses, as a single number between 0 and 100, how far Korean semiconductor equities have moved away from their own long-term trend. Readings near 100 mean prices sit well above trend; readings near 0 mean they sit well below it.",
      "The index is built from price and trend only. It contains no earnings data, no DRAM or NAND contract prices, and no inventory figures. KSS therefore summarises how the market is currently pricing the sector — not whether the underlying business cycle is strong or weak.",
      "Every formula and weight used in the calculation is published below so that the same inputs reproduce the same number.",
    ],
    formulaHeading: "Inputs and weights",
    formulaIntro:
      "Each of the five inputs is converted to a 0–100 score and combined with the weights below. If an input is unavailable, it is excluded and the remaining weights are renormalised to sum to 100%.",
    mappingHeading: "Score mapping",
    mappings: [
      {
        title: "200-day MA deviation → score",
        body:
          "A deviation of 0% maps to 50. +40% maps to 100 and −40% maps to 0, linearly, clipped at both ends. KOSPI uses a narrower ±30% range because the index itself is far less volatile than single stocks.",
      },
      {
        title: "52-week drawdown → score",
        body:
          "At the high (0%) the score is 100; −30% maps to 40 and −50% or worse maps to 0. Deeper drawdowns therefore reduce the reading.",
      },
      {
        title: "50-day MA flag → score",
        body:
          "70 if a majority of the two stocks trade above their 50-day average, otherwise 30. Because it has no intermediate values, its weight is held to 15%.",
      },
    ],
    dataHeading: "Data and updates",
    dataBody: [
      "Prices are daily closes for Samsung Electronics (005930.KS), SK hynix (000660.KS), the Philadelphia Semiconductor Index (^SOX) and KOSPI (^KS11), adjusted for dividends and splits.",
      "Moving averages and 52-week highs are computed on each series' own trading calendar. Korean and US market holidays differ, so aligning to a shared calendar before averaging would distort the rolling windows. Each indicator is computed first and only then aligned to KOSPI trading days.",
      "The index updates once daily after the Korean close. Because US markets close later, a given date's KSS uses that same date's SOX close. This is an end-of-day series, not a real-time one.",
    ],
    limitsHeading: "Limitations",
    limits: [
      "No fundamentals. Contract prices for DRAM and NAND, inventory levels and capital expenditure are not included. Price alone does not distinguish a cycle bottom from the early stage of a decline.",
      "Two stocks only. Samsung and SK hynix drive the reading, so divergent moves in materials, equipment or back-end firms are not captured.",
      "The weights are a design choice. They were assigned by judgement about what each input measures, not fitted statistically. Different weights produce different readings.",
      "A high reading is not a forecast. In the historical record, stretched readings have both persisted and reversed quickly. The index measures where prices are, not where they are going.",
      "This is not an official index. It is not produced by an exchange or index provider and does not underlie any financial product.",
    ],
  },
  faq: {
    heading: "Frequently asked questions",
    items: [
      {
        q: "Does a high KSS mean I should sell?",
        a: "No. This is not a trading signal. A high reading states that prices are far above their long-term trend; it says nothing about how long that will last. The historical record contains stretched readings that held for months.",
      },
      {
        q: "How does this differ from the CNN Fear & Greed Index?",
        a: "Different scope and construction. CNN measures broad US market sentiment using options, credit and volatility inputs. KSS is limited to Korean semiconductors and measures only how far prices sit from their own long-term trend — a position gauge rather than a sentiment gauge.",
      },
      {
        q: "Why does the history start in 2000?",
        a: "A 200-day moving average needs at least 200 trading days, and the point at which all four series are simultaneously available is the second half of 2000. Earlier dates are excluded because some inputs cannot be computed.",
      },
      {
        q: "My number differs slightly from yours.",
        a: "Most often this is timing. Computing the index intraday or before the open uses the previous session's close. This site publishes a value only after the Korean close is final.",
      },
      {
        q: "Can I download the data?",
        a: "Yes. The full history is available as JSON and may be quoted freely with attribution.",
      },
    ],
  },
  disclaimer:
    "This site is published for informational purposes and is not investment advice or a solicitation to trade. The index is a reference measure derived from public price data by a fixed formula. It does not recommend buying or selling any security and guarantees no outcome. Investment decisions and their consequences are the responsibility of the individual. Data may contain errors or delays.",
  disclaimerShort: "A reference measure, not investment advice. Decisions are your own responsibility.",
  footerUpdated: "Last updated",
  langSwitch: "한국어",
};

export const DICTS: Record<Lang, Dict> = { ko, en };

export function isLang(v: string): v is Lang {
  return (LANGS as readonly string[]).includes(v);
}

export function dict(lang: Lang): Dict {
  return DICTS[lang];
}

export function otherLang(lang: Lang): Lang {
  return lang === "ko" ? "en" : "ko";
}
