import { INDEX_PATH, type IndexData, type IndexId } from "@/lib/indices";
import { summarizeCycles } from "@/lib/cycles";
import { dict, type Lang } from "@/lib/i18n";
import { SITE_URL, dataPath } from "@/lib/site";

/**
 * 역대 사이클 표의 구조화 데이터.
 *
 * 검색엔진과 AI 요약이 이 페이지를 "구간 목록을 가진 데이터셋"으로 읽게 한다.
 * 네이버 AI 브리핑·구글 AI 개요가 같은 질문에 인용할 원자료가 없는 상태라
 * (2026-07 확인) 인용 가능한 형태로 내보내는 것이 이 페이지의 목적이다.
 */
export default function CyclesJsonLd({
  id,
  data,
  lang,
}: {
  id: IndexId;
  data: IndexData;
  lang: Lang;
}) {
  const t = dict(lang);
  const ix = t.indices[id];
  const s = summarizeCycles(id, data);
  const { meta } = data;
  const url = `${SITE_URL}/${lang}/${INDEX_PATH[id]}cycles/`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: t.cycles.title(ix.title),
    description: t.cycles.metaDescription(meta.first_date, meta.last_date),
    url,
    inLanguage: lang,
    temporalCoverage: `${meta.first_date}/${meta.last_date}`,
    dateModified: meta.last_date,
    isAccessibleForFree: true,
    license: "https://creativecommons.org/licenses/by/4.0/",
    creator: { "@type": "Organization", name: "DailyStudio" },
    isBasedOn: `${SITE_URL}/${lang}/${INDEX_PATH[id]}`,
    variableMeasured: [
      {
        "@type": "PropertyValue",
        name: lang === "ko" ? "과열 구간 수" : "Overheated phases",
        value: s.hot.length,
      },
      {
        "@type": "PropertyValue",
        name: lang === "ko" ? "침체 구간 수" : "Depressed phases",
        value: s.cold.length,
      },
      {
        "@type": "PropertyValue",
        name: lang === "ko" ? "역대 최고값" : "All-time high",
        value: s.allTimeHigh.value,
        valueReference: s.allTimeHigh.date,
      },
      {
        "@type": "PropertyValue",
        name: lang === "ko" ? "역대 최저값" : "All-time low",
        value: s.allTimeLow.value,
        valueReference: s.allTimeLow.date,
      },
    ],
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: `${SITE_URL}${dataPath(id)}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
