import type { IndexId } from "./indices";

export const LANGS = ["ko", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "ko";

export const BRAND = "SemiCycle";

type StateText = { label: string; band: string; meaning: string };
type ComponentText = { label: string; weight: string; what: string };

type IndexDict = {
  /** 브라우저 탭·헤딩에 쓰는 지표 이름 */
  title: string;
  /** 내비게이션용 짧은 이름 */
  short: string;
  tagline: string;
  metaDescription: string;
  states: Record<string, StateText>;
  components: Record<string, ComponentText>;
  intro: string[];
  mappings: { title: string; body: string }[];
  dataBody: string[];
  limits: string[];
  faq: { q: string; a: string }[];
  /** 분포 편향처럼 반드시 밝혀야 하는 특이사항 (없으면 생략) */
  distributionNote?: string;
};

type Dict = {
  tagline: string;
  nav: { methodology: string };
  today: string;
  asOf: string;
  percentile: (p: number) => string;
  percentileHelp: string;
  componentsHeading: string;
  componentsIntro: string;
  bandsHeading: string;
  colScore: string;
  colWeight: string;
  colRaw: string;
  yes: string;
  no: string;
  historyHeading: string;
  historyIntro: (from: string, to: string, n: number) => string;
  rangeLabels: Record<string, string>;
  methodologyHeading: string;
  formulaHeading: string;
  formulaIntro: string;
  mappingHeading: string;
  dataHeading: string;
  limitsHeading: string;
  distributionHeading: string;
  faqHeading: string;
  otherIndices: string;
  downloadNote: string;
  disclaimer: string;
  footerUpdated: string;
  langSwitch: string;
  indices: Record<IndexId, IndexDict>;
};

const ko: Dict = {
  tagline: "한국 증시 사이클 지표",
  nav: { methodology: "계산 방법" },
  today: "오늘의 지수",
  asOf: "기준일",
  percentile: (p) => `전체 이력에서 상위 ${(100 - p).toFixed(1)}% 수준`,
  percentileHelp:
    "전체 이력에서 오늘보다 낮은 값이 차지하는 비율입니다. 100에 가까울수록 역사적으로 드문 높은 값입니다.",
  componentsHeading: "구성 지표",
  componentsIntro:
    "각 항목을 0~100으로 변환한 뒤 가중평균합니다. 모든 항목은 값이 클수록 지수를 끌어올립니다. 값을 구하지 못한 항목이 있으면 그 항목을 빼고 남은 가중치를 다시 100%로 환산합니다.",
  bandsHeading: "국면 구분",
  colScore: "점수",
  colWeight: "가중치",
  colRaw: "원값",
  yes: "위",
  no: "아래",
  historyHeading: "전체 이력",
  historyIntro: (from, to, n) =>
    `${from}부터 ${to}까지 ${n.toLocaleString("ko-KR")}거래일을 같은 산식으로 소급 계산했습니다. 지표를 만든 날부터가 아니라 데이터가 존재하는 전 기간을 계산했기 때문에, 지금 값이 과거 사이클에서 어디쯤인지 바로 비교할 수 있습니다.`,
  rangeLabels: { "1y": "1년", "5y": "5년", all: "전체" },
  methodologyHeading: "계산 방법",
  formulaHeading: "구성과 가중치",
  formulaIntro:
    "각 항목을 0~100 점수로 바꾼 뒤 아래 가중치로 평균합니다. 어떤 항목의 값을 구하지 못하면 그 항목을 제외하고 남은 가중치의 합으로 나누어 다시 100% 기준으로 환산합니다.",
  mappingHeading: "점수 변환 규칙",
  dataHeading: "데이터와 갱신",
  limitsHeading: "이 지표의 한계",
  distributionHeading: "값의 분포",
  faqHeading: "자주 묻는 질문",
  otherIndices: "다른 지수",
  downloadNote: "전체 이력 내려받기",
  disclaimer:
    "이 사이트는 정보 제공을 목적으로 하며 투자 권유나 자문이 아닙니다. 게시된 지수는 공개된 가격 데이터를 정해진 산식으로 가공한 참고 지표로, 특정 종목의 매수·매도를 권유하지 않으며 수익을 보장하지 않습니다. 투자 판단과 그 결과에 대한 책임은 투자자 본인에게 있습니다. 데이터에 오류나 지연이 있을 수 있습니다.",
  footerUpdated: "최종 갱신",
  langSwitch: "English",
  indices: {
    kss: {
      title: "반도체 사이클 지수",
      short: "반도체 사이클",
      tagline: "삼성전자·SK하이닉스·SOX·KOSPI를 합성한 0~100 과열도 지표",
      metaDescription:
        "한국 반도체 사이클 스코어(KSS). 삼성전자·SK하이닉스의 200일선 이격과 52주 낙폭, 필라델피아 반도체지수(SOX), KOSPI를 가중 합성해 0~100으로 나타낸 과열도 지표. 2000년부터의 전체 이력과 계산 방법을 공개합니다.",
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
            "글로벌 반도체 업황을 대표하는 지수의 추세 대비 위치입니다. 한국 반도체 주가가 SOX를 따라가는 경향이 있어 별도 항목으로 넣었습니다.",
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
            "두 종목의 과반이 50일 이동평균 위에 있는지를 봅니다. 단기 모멘텀 항목으로, 위면 70점 아래면 30점만 부여하는 이진 지표입니다.",
        },
        kospi_dev200: {
          label: "KOSPI 200일선 이격",
          weight: "15%",
          what:
            "시장 전체의 과열도입니다. 반도체만의 문제인지 국내 증시 전반의 흐름인지를 구분하기 위해 넣었습니다.",
        },
      },
      intro: [
        "반도체 사이클 지수(KSS, Korea Semiconductor Score)는 한국 반도체 관련 주가가 자신의 장기 추세에서 얼마나 벌어져 있는지를 0에서 100 사이의 한 숫자로 나타낸 지표입니다. 100에 가까울수록 추세 대비 높이 올라와 있고, 0에 가까울수록 크게 내려와 있다는 뜻입니다.",
        "이 지표는 가격과 추세만으로 계산합니다. 실적이나 메모리 고정거래가, 재고 수준 같은 펀더멘털 데이터는 들어가 있지 않습니다. 따라서 KSS는 '지금 시장이 이 업종을 어떻게 평가하고 있는가'를 요약한 것이지, '반도체 업황이 좋은가 나쁜가'를 판정한 것이 아닙니다.",
        "계산에 쓰는 모든 산식과 가중치를 아래에 전부 공개합니다. 같은 데이터로 같은 값을 재현할 수 있도록 하기 위해서입니다.",
      ],
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
      dataBody: [
        "가격 데이터는 삼성전자(005930.KS), SK하이닉스(000660.KS), 필라델피아 반도체지수(^SOX), KOSPI(^KS11)의 일별 종가를 사용합니다. 배당·액면분할이 반영된 수정주가 기준입니다.",
        "이동평균과 52주 고점은 각 종목이 실제로 거래된 날만으로 계산합니다. 한국과 미국의 휴장일이 다르기 때문에, 공통 달력에 먼저 맞추고 평균을 내면 값이 왜곡됩니다. 각자의 거래일에서 지표를 먼저 구한 뒤 KOSPI 거래일 기준으로 정렬합니다.",
        "지수는 하루 한 번, 양 시장이 모두 마감한 뒤에 갱신합니다. 장중에 계산하면 확정되지 않은 잠정가가 섞이기 때문입니다. 실시간 지표가 아니라 종가 기준 일별 지표입니다.",
      ],
      limits: [
        "펀더멘털이 빠져 있습니다. DRAM·NAND 고정거래가, 재고, 설비투자 같은 업황 데이터가 들어가지 않습니다. 사이클의 바닥과 하락 초입은 가격만으로 구분되지 않습니다.",
        "두 종목에 의존합니다. 삼성전자와 SK하이닉스만 보므로, 소재·장비·후공정 업체의 흐름이 다를 때는 반영되지 않습니다.",
        "가중치는 설계자가 정한 값입니다. 통계적으로 최적화한 것이 아니라 각 항목의 성격을 고려해 배분한 것입니다. 다른 가중치를 쓰면 다른 값이 나옵니다.",
        "높은 값이 하락을 예고하지 않습니다. 과거 이력에서 높은 구간이 오래 유지된 경우도, 곧바로 되돌린 경우도 모두 있습니다. 이 지표는 예측이 아니라 현재 위치의 측정입니다.",
        "공식 지수가 아닙니다. 거래소나 지수 사업자가 산출하는 지수가 아니며, 어떤 금융상품의 기초자산도 아닙니다.",
      ],
      faq: [
        {
          q: "KSS가 높으면 팔아야 하나요?",
          a: "아닙니다. 이 지표는 매매 신호가 아닙니다. 값이 높다는 것은 가격이 장기 추세선에서 위로 많이 벌어져 있다는 사실을 나타낼 뿐이며, 그 상태가 얼마나 이어질지는 알려주지 않습니다. 전체 이력을 보면 높은 구간이 수개월 유지된 시기도 있습니다.",
        },
        {
          q: "왜 2000년부터인가요?",
          a: "200일 이동평균을 계산하려면 최소 200거래일의 가격이 필요하고, 네 시계열이 모두 확보되는 시점이 2000년 하반기입니다. 그 이전 구간은 항목 중 일부를 계산할 수 없어 제외했습니다.",
        },
        {
          q: "값이 다른 곳과 조금씩 다릅니다.",
          a: "계산 시점 때문일 수 있습니다. 장중이나 개장 전에 계산하면 확정되지 않은 가격이 쓰입니다. 이 사이트는 양 시장 마감이 확정된 뒤에 계산한 값만 게시하며, 한 번 게시한 날짜의 값은 나중에 바꾸지 않습니다.",
        },
      ],
    },

    kfg: {
      title: "코스피 공포·탐욕 지수",
      short: "공포·탐욕",
      tagline: "KOSPI 모멘텀·52주 위치·변동성으로 만든 0~100 투자심리 지표",
      metaDescription:
        "코스피 공포탐욕지수(KFG). KOSPI의 125일선 이격, 52주 레인지 내 위치, 20일 실현변동성의 1년 백분위를 합성해 0(극단적 공포)~100(극단적 탐욕)으로 나타낸 투자심리 지표. 1998년부터의 전체 이력과 계산 방법을 공개합니다.",
      states: {
        extreme_greed: {
          label: "극단적 탐욕",
          band: "75 이상",
          meaning:
            "가격이 추세 위로 크게 올라와 있고 변동성은 낮은 구간입니다. 과거 2007년 상승장과 2021년 초 같은 시기가 여기에 해당했습니다.",
        },
        greed: {
          label: "탐욕",
          band: "55 ~ 75",
          meaning: "추세 위에 있으나 극단은 아닌 구간입니다. 상승 국면에서 가장 흔하게 나타납니다.",
        },
        neutral: {
          label: "중립",
          band: "45 ~ 55",
          meaning: "세 항목이 서로 상쇄되는 구간입니다. 이 지표만으로는 방향성을 읽기 어렵습니다.",
        },
        fear: {
          label: "공포",
          band: "25 ~ 45",
          meaning:
            "추세 아래로 내려왔거나 변동성이 평소보다 높아진 구간입니다. 조정 국면에서 자주 나타납니다.",
        },
        extreme_fear: {
          label: "극단적 공포",
          band: "25 미만",
          meaning:
            "낙폭과 변동성이 동시에 극단으로 간 구간입니다. 2008년 10월, 2020년 3월 같은 시기가 여기에 해당했습니다. 바닥 부근에서 나타나기도 하지만 하락이 이어지는 내내 낮게 유지되기도 합니다.",
        },
      },
      components: {
        momentum: {
          label: "모멘텀 — KOSPI 125일선 이격",
          weight: "40%",
          what:
            "KOSPI가 자신의 125일 이동평균에서 몇 % 떨어져 있는지입니다. 중기 추세 대비 현재 위치를 재며, ±12%를 각각 100점과 0점으로 환산합니다.",
        },
        range52w: {
          label: "52주 레인지 내 위치",
          weight: "30%",
          what:
            "최근 52주의 최저가와 최고가 사이에서 현재가가 어디쯤인지를 0~100으로 나타냅니다. 신고가 근처면 100, 신저가 근처면 0에 가까워집니다.",
        },
        volatility: {
          label: "변동성 (1년 백분위의 역수)",
          weight: "30%",
          what:
            "20일 실현변동성이 지난 1년 안에서 몇 번째 백분위인지를 구한 뒤 100에서 뺍니다. 변동성이 낮을수록 점수가 높아집니다. 절대 수치가 아니라 백분위를 쓰는 이유는 아래 계산 방법에 적어두었습니다.",
        },
      },
      intro: [
        "코스피 공포·탐욕 지수(KFG)는 한국 증시의 투자심리를 0에서 100 사이의 한 숫자로 나타낸 지표입니다. 0에 가까울수록 공포, 100에 가까울수록 탐욕이며 CNN 공포탐욕지수와 같은 방향입니다.",
        "한국에는 공식 공포·탐욕 지수가 없습니다. CNN 지수는 옵션 거래량, 정크본드 스프레드 같은 미국 시장 고유의 데이터를 씁니다. 이 지표는 그 구성을 KOSPI 가격만으로 재현할 수 있는 세 축으로 옮긴 프록시입니다. 심리를 직접 측정한 것이 아니라 가격이 남긴 흔적으로 추정한 값입니다.",
        "가격만 쓰기 때문에 1998년까지 거슬러 올라가 같은 산식으로 계산할 수 있습니다. 산식과 가중치를 아래에 전부 공개합니다.",
      ],
      mappings: [
        {
          title: "125일선 이격 → 점수",
          body:
            "이격도가 0%일 때 50점, +12%면 100점, -12%면 0점이 되도록 선형 변환하고 범위를 벗어나면 잘라냅니다. KOSPI의 통상 변동폭에 맞춰 ±12%로 잡았습니다.",
        },
        {
          title: "52주 위치 → 점수",
          body:
            "(현재가 − 52주 최저) ÷ (52주 최고 − 52주 최저) × 100 을 그대로 점수로 씁니다. 별도 변환이 없는 유일한 항목입니다.",
        },
        {
          title: "변동성 → 점수",
          body:
            "20일 실현변동성을 연율로 환산한 뒤, 그 값이 직전 1년 분포에서 차지하는 백분위를 구해 100에서 뺍니다. 변동성이 1년 중 가장 높으면 0점, 가장 낮으면 100점입니다.",
        },
      ],
      dataBody: [
        "KOSPI(^KS11)의 일별 종가만 사용합니다. 외부 설문이나 옵션 데이터는 쓰지 않으므로 전 구간을 같은 방식으로 계산할 수 있습니다.",
        "변동성을 절대 수치가 아니라 백분위로 쓰는 이유가 있습니다. 변동성의 정상 수준은 시대마다 다릅니다. 2008년의 '평온한 날'과 2017년의 '평온한 날'은 수치가 전혀 다르기 때문에, 절대값을 기준으로 삼으면 과거 구간 전체가 한쪽으로 쏠립니다. 직전 1년 대비 상대 위치로 보면 국면이 바뀌어도 같은 의미를 유지합니다.",
        "지수는 하루 한 번, 장 마감이 확정된 뒤에 갱신합니다. 한 번 게시한 날짜의 값은 나중에 바꾸지 않습니다.",
      ],
      limits: [
        "심리를 직접 측정하지 않습니다. 투자자 설문이나 자금 흐름이 아니라 가격 움직임만 봅니다. 가격에 드러나지 않은 심리 변화는 잡히지 않습니다.",
        "지수 하나만 봅니다. KOSPI만 쓰므로 코스닥이나 개별 업종의 흐름은 반영되지 않습니다.",
        "CNN 지수와 직접 비교할 수 없습니다. 구성 항목이 다르므로 같은 숫자라도 뜻이 같지 않습니다.",
        "낮은 값이 매수 시점을 뜻하지 않습니다. 2008년처럼 극단적 공포가 몇 달간 이어지며 가격이 더 내려간 구간도 있습니다.",
        "공식 지수가 아닙니다. 거래소나 지수 사업자가 산출하는 지수가 아니며, 어떤 금융상품의 기초자산도 아닙니다.",
      ],
      distributionNote:
        "이 지표의 값은 중앙에 고르게 퍼져 있지 않습니다. 전체 이력의 평균은 약 57, 중앙값은 약 61이며 탐욕권(55 이상)이 전체의 약 57%, 공포권(45 미만)이 약 33%를 차지합니다. 장기 상승장에서는 가격이 이동평균 위에, 52주 레인지의 위쪽에 머무는 시간이 더 길기 때문에 생기는 산식 고유의 성질입니다. 따라서 50이 '중립'이라고 단정하기보다, 함께 표시되는 백분위를 같이 보시는 편이 정확합니다.",
      faq: [
        {
          q: "CNN 공포탐욕지수와 무엇이 다른가요?",
          a: "대상 시장과 구성이 다릅니다. CNN 지수는 미국 증시를 대상으로 옵션 거래량, 정크본드 수요, 안전자산 선호 등 일곱 개 항목을 씁니다. 이 지표는 KOSPI 가격에서 구할 수 있는 세 항목만 씁니다. 방향(0=공포, 100=탐욕)은 같지만 같은 숫자가 같은 상태를 뜻하지는 않습니다.",
        },
        {
          q: "과거 위기 때 실제로 낮게 나왔나요?",
          a: "그렇습니다. 2008년 10월 평균 1.4, 2020년 3월 평균 9.5, 2000년 10월 평균 5.1을 기록했습니다. 반대로 2021년 1월은 평균 80.0이었습니다. 다만 이는 지표가 사후적으로 그 시기를 잘 표현한다는 뜻이지, 미리 알려준다는 뜻이 아닙니다.",
        },
        {
          q: "왜 1998년부터인가요?",
          a: "52주 고저와 변동성 백분위를 계산하려면 최소 252거래일의 가격이 필요합니다. KOSPI 데이터가 1996년 말부터 확보되므로 그 조건을 만족하는 첫 시점이 1998년 1월입니다.",
        },
      ],
    },
  },
};

const en: Dict = {
  tagline: "Cycle indices for the Korean market",
  nav: { methodology: "Methodology" },
  today: "Today's reading",
  asOf: "As of",
  percentile: (p) => `Top ${(100 - p).toFixed(1)}% of the full record`,
  percentileHelp:
    "The share of the full history that sits below today's value. Closer to 100 means a historically rare, high reading.",
  componentsHeading: "Components",
  componentsIntro:
    "Each input is mapped to a 0–100 score and then averaged with the weights below. Higher always pushes the index up. If an input cannot be computed, it is dropped and the remaining weights are rescaled to 100%.",
  bandsHeading: "Reading bands",
  colScore: "Score",
  colWeight: "Weight",
  colRaw: "Raw",
  yes: "Above",
  no: "Below",
  historyHeading: "Full history",
  historyIntro: (from, to, n) =>
    `${n.toLocaleString("en-US")} trading days from ${from} to ${to}, recomputed with the same formula throughout. Because the history is backfilled across the entire available price record rather than starting the day the index launched, today's reading can be compared directly against past cycles.`,
  rangeLabels: { "1y": "1Y", "5y": "5Y", all: "All" },
  methodologyHeading: "Methodology",
  formulaHeading: "Inputs and weights",
  formulaIntro:
    "Each input is converted to a 0–100 score and combined with the weights below. If an input is unavailable, it is excluded and the remaining weights are renormalised to sum to 100%.",
  mappingHeading: "Score mapping",
  dataHeading: "Data and updates",
  limitsHeading: "Limitations",
  distributionHeading: "How the values are distributed",
  faqHeading: "Frequently asked questions",
  otherIndices: "Other indices",
  downloadNote: "Download the full history",
  disclaimer:
    "This site is published for informational purposes and is not investment advice or a solicitation to trade. The indices are reference measures derived from public price data by fixed formulas. They do not recommend buying or selling any security and guarantee no outcome. Investment decisions and their consequences are the responsibility of the individual. Data may contain errors or delays.",
  footerUpdated: "Last updated",
  langSwitch: "한국어",
  indices: {
    kss: {
      title: "Korea Semiconductor Cycle Index",
      short: "Semiconductor cycle",
      tagline: "A 0–100 froth gauge built from Samsung, SK hynix, SOX and KOSPI",
      metaDescription:
        "Korea Semiconductor Score (KSS): a 0–100 index combining the 200-day moving-average deviation and 52-week drawdown of Samsung Electronics and SK hynix with the Philadelphia Semiconductor Index (SOX) and KOSPI. Full history since 2000 and the complete formula are published.",
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
      intro: [
        "The Korea Semiconductor Score (KSS) expresses, as a single number between 0 and 100, how far Korean semiconductor equities have moved away from their own long-term trend. Readings near 100 mean prices sit well above trend; readings near 0 mean they sit well below it.",
        "The index is built from price and trend only. It contains no earnings data, no DRAM or NAND contract prices, and no inventory figures. KSS therefore summarises how the market is currently pricing the sector — not whether the underlying business cycle is strong or weak.",
        "Every formula and weight used in the calculation is published below so that the same inputs reproduce the same number.",
      ],
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
      dataBody: [
        "Prices are daily closes for Samsung Electronics (005930.KS), SK hynix (000660.KS), the Philadelphia Semiconductor Index (^SOX) and KOSPI (^KS11), adjusted for dividends and splits.",
        "Moving averages and 52-week highs are computed on each series' own trading calendar. Korean and US market holidays differ, so aligning to a shared calendar before averaging would distort the rolling windows. Each indicator is computed first and only then aligned to KOSPI trading days.",
        "The index updates once daily, after both markets have closed — computing intraday would mix in prices that have not settled. This is an end-of-day series, not a real-time one.",
      ],
      limits: [
        "No fundamentals. Contract prices for DRAM and NAND, inventory levels and capital expenditure are not included. Price alone does not distinguish a cycle bottom from the early stage of a decline.",
        "Two stocks only. Samsung and SK hynix drive the reading, so divergent moves in materials, equipment or back-end firms are not captured.",
        "The weights are a design choice. They were assigned by judgement about what each input measures, not fitted statistically. Different weights produce different readings.",
        "A high reading is not a forecast. In the historical record, stretched readings have both persisted and reversed quickly. The index measures where prices are, not where they are going.",
        "This is not an official index. It is not produced by an exchange or index provider and does not underlie any financial product.",
      ],
      faq: [
        {
          q: "Does a high KSS mean I should sell?",
          a: "No. This is not a trading signal. A high reading states that prices are far above their long-term trend; it says nothing about how long that will last. The historical record contains stretched readings that held for months.",
        },
        {
          q: "Why does the history start in 2000?",
          a: "A 200-day moving average needs at least 200 trading days, and the point at which all four series are simultaneously available is the second half of 2000. Earlier dates are excluded because some inputs cannot be computed.",
        },
        {
          q: "My number differs slightly from yours.",
          a: "Most often this is timing. Computing the index intraday or before the open uses prices that have not settled. This site publishes a value only after both closes are final, and never revises a value once published.",
        },
      ],
    },

    kfg: {
      title: "KOSPI Fear & Greed Index",
      short: "Fear & Greed",
      tagline: "A 0–100 sentiment gauge from KOSPI momentum, 52-week position and volatility",
      metaDescription:
        "KOSPI Fear & Greed Index (KFG): a 0–100 sentiment gauge combining KOSPI's 125-day moving-average deviation, its position within the 52-week range, and the one-year percentile of 20-day realised volatility. Full history since 1998 and the complete formula are published.",
      states: {
        extreme_greed: {
          label: "Extreme greed",
          band: "75 and above",
          meaning:
            "Prices well above trend while volatility is low. The 2007 advance and early 2021 both sat here.",
        },
        greed: {
          label: "Greed",
          band: "55 – 75",
          meaning: "Above trend but not at an extreme — the most common state during an advance.",
        },
        neutral: {
          label: "Neutral",
          band: "45 – 55",
          meaning: "The three inputs offset one another. The index says little about direction here.",
        },
        fear: {
          label: "Fear",
          band: "25 – 45",
          meaning:
            "Prices have slipped below trend, or volatility has risen above its recent norm. Common during corrections.",
        },
        extreme_fear: {
          label: "Extreme fear",
          band: "Below 25",
          meaning:
            "Drawdown and volatility at extremes together — October 2008 and March 2020 both sat here. This band has appeared near lows, but it can also stay low throughout a continuing decline.",
        },
      },
      components: {
        momentum: {
          label: "Momentum — KOSPI 125-day MA deviation",
          weight: "40%",
          what:
            "How far KOSPI trades from its own 125-day moving average. It measures position against the intermediate trend, with ±12% mapping to 100 and 0 respectively.",
        },
        range52w: {
          label: "Position within the 52-week range",
          weight: "30%",
          what:
            "Where the current level sits between the 52-week low and high, expressed as 0–100. Near the high it approaches 100; near the low it approaches 0.",
        },
        volatility: {
          label: "Volatility (inverse of its one-year percentile)",
          weight: "30%",
          what:
            "The percentile of 20-day realised volatility within the trailing year, subtracted from 100. Calmer markets score higher. The reason for using a percentile rather than an absolute level is explained in the methodology below.",
        },
      },
      intro: [
        "The KOSPI Fear & Greed Index (KFG) expresses Korean market sentiment as a single number between 0 and 100 — 0 for fear, 100 for greed, the same direction as the CNN index.",
        "Korea has no official fear and greed index. The CNN version draws on options volume, junk-bond spreads and other inputs specific to US markets. This index is a proxy that moves that structure onto three axes reproducible from KOSPI prices alone. It does not measure sentiment directly; it infers it from the traces sentiment leaves in price.",
        "Because it uses only price, the same formula can be carried back to 1998. The formula and weights are published in full below.",
      ],
      mappings: [
        {
          title: "125-day MA deviation → score",
          body:
            "A deviation of 0% maps to 50, +12% to 100 and −12% to 0, linearly and clipped at both ends. The ±12% range reflects KOSPI's typical swing.",
        },
        {
          title: "52-week position → score",
          body:
            "(price − 52-week low) ÷ (52-week high − 52-week low) × 100, used directly. This is the only input with no further transformation.",
        },
        {
          title: "Volatility → score",
          body:
            "20-day realised volatility is annualised, its percentile within the trailing year is taken, and that percentile is subtracted from 100. The most volatile day of the past year scores 0; the calmest scores 100.",
        },
      ],
      dataBody: [
        "Only the daily closes of KOSPI (^KS11) are used. No survey or options data enters the calculation, which is what makes the whole record computable on identical terms.",
        "Volatility enters as a percentile rather than an absolute level for a reason. What counts as normal volatility differs by era: a calm day in 2008 and a calm day in 2017 are numerically far apart, so an absolute threshold would tilt entire historical stretches in one direction. A percentile against the trailing year keeps the meaning stable as regimes change.",
        "The index updates once daily after the close is final, and a published value is never revised.",
      ],
      limits: [
        "Sentiment is not measured directly. There is no survey and no flow data — only price. Sentiment that has not yet shown up in price will not appear here.",
        "One index only. KOSPI alone is used, so KOSDAQ and individual sectors are not represented.",
        "Not comparable to the CNN index. The inputs differ, so an identical number does not describe an identical state.",
        "A low reading is not a buy signal. In 2008, extreme fear persisted for months while prices continued to fall.",
        "This is not an official index. It is not produced by an exchange or index provider and does not underlie any financial product.",
      ],
      distributionNote:
        "The values are not evenly spread around the midpoint. Across the full record the mean is about 57 and the median about 61; greed territory (55 and above) covers roughly 57% of days and fear territory (below 45) roughly 33%. This is a property of the formula: during long advances, prices spend more time above their moving average and in the upper part of the 52-week range. Rather than treating 50 as neutral, read the percentile shown alongside the value.",
      faq: [
        {
          q: "How does this differ from the CNN Fear & Greed Index?",
          a: "Different market and different construction. CNN covers US equities using seven inputs including options volume, junk-bond demand and safe-haven preference. This index uses the three inputs obtainable from KOSPI prices. The direction is the same (0 fear, 100 greed) but an identical number does not mean an identical state.",
        },
        {
          q: "Did it actually read low during past crises?",
          a: "Yes. October 2008 averaged 1.4, March 2020 averaged 9.5 and October 2000 averaged 5.1, while January 2021 averaged 80.0. That shows the index describes those periods well after the fact — not that it announced them in advance.",
        },
        {
          q: "Why does the history start in 1998?",
          a: "The 52-week range and the volatility percentile each need at least 252 trading days of prices. KOSPI data is available from late 1996, so the first date satisfying that requirement is January 1998.",
        },
      ],
    },
  },
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
