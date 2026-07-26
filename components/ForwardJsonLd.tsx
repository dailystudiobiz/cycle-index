import { DETAIL_HORIZON, type ForwardData } from "@/lib/forward";
import { INDEX_PATH } from "@/lib/indices";
import { dict, type Lang } from "@/lib/i18n";
import { SITE_URL, dataPath } from "@/lib/site";

const ID = "kfg" as const;

/**
 * 국면별 이후 등락 표의 구조화 데이터.
 *
 * "공포탐욕지수 백테스트"류 질문에 한국 시장 기준으로 답하는 원자료가 웹에 없어
 * (2026-07 확인) AI 요약이 미국 결과나 증권사 PDF를 인용한다. 인용 가능한
 * 형태로 내보내는 것이 목적이라 핵심 수치를 variableMeasured 로 노출한다.
 */
export default function ForwardJsonLd({ data, lang }: { data: ForwardData; lang: Lang }) {
  const t = dict(lang);
  const f = t.forward;
  const states = t.indices[ID].states;
  const { meta, baseline, buckets } = data;
  const url = `${SITE_URL}/${lang}/${INDEX_PATH[ID]}outcomes/`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: f.title,
    description: f.metaDescription(meta.first_date, meta.last_date),
    url,
    inLanguage: lang,
    temporalCoverage: `${meta.first_date}/${meta.last_date}`,
    dateModified: meta.last_date,
    isAccessibleForFree: true,
    license: "https://creativecommons.org/licenses/by/4.0/",
    creator: { "@type": "Organization", name: "DailyStudio" },
    isBasedOn: `${SITE_URL}/${lang}/${INDEX_PATH[ID]}`,
    measurementTechnique:
      lang === "ko"
        ? `공포탐욕지수 구간별로 묶은 뒤 ${DETAIL_HORIZON}거래일 등 여러 기간의 KOSPI 등락 분포를 집계`
        : `KOSPI forward returns grouped by fear & greed band over ${meta.horizons.join(", ")} trading days`,
    variableMeasured: [
      ...buckets.map((b) => ({
        "@type": "PropertyValue",
        name:
          lang === "ko"
            ? `${states[b.state]?.label ?? b.state} 구간 이후 ${DETAIL_HORIZON}거래일 등락 중앙값`
            : `Median ${DETAIL_HORIZON}-day move after ${states[b.state]?.label ?? b.state}`,
        value: b.horizons[DETAIL_HORIZON]?.median ?? null,
        unitText: "PERCENT",
        measurementMethod:
          lang === "ko"
            ? `${b.days}거래일 / ${b.episodes}국면`
            : `${b.days} trading days across ${b.episodes} episodes`,
      })),
      {
        "@type": "PropertyValue",
        name:
          lang === "ko"
            ? `전체 기간 ${DETAIL_HORIZON}거래일 등락 중앙값`
            : `Median ${DETAIL_HORIZON}-day move, all days`,
        value: baseline[DETAIL_HORIZON]?.median ?? null,
        unitText: "PERCENT",
      },
    ],
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: `${SITE_URL}${dataPath(ID)}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
