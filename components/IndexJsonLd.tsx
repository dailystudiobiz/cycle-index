import { INDEX_PATH, type IndexData, type IndexId } from "@/lib/indices";
import { dict, type Lang } from "@/lib/i18n";
import { SITE_URL, dataPath } from "@/lib/site";

/**
 * 구조화 데이터. 검색엔진과 AI가 "무엇을 재는 지표이고 데이터가 어디 있는지"를
 * 읽게 한다. 백링크가 없는 신규 도메인에서는 이게 초기 유입 경로가 된다.
 */
export default function IndexJsonLd({
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
  const { meta, latest } = data;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: ix.title,
    description: ix.metaDescription,
    url: `${SITE_URL}/${lang}/${INDEX_PATH[id]}`,
    inLanguage: lang,
    temporalCoverage: `${meta.first_date}/${meta.last_date}`,
    dateModified: meta.last_date,
    isAccessibleForFree: true,
    license: "https://creativecommons.org/licenses/by/4.0/",
    creator: { "@type": "Organization", name: "DailyStudio" },
    variableMeasured: {
      "@type": "PropertyValue",
      name: id.toUpperCase(),
      description: ix.tagline,
      minValue: 0,
      maxValue: 100,
      value: latest.value,
    },
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
