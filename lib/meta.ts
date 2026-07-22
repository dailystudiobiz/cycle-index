import type { Metadata } from "next";
import { INDEX_PATH, type IndexId } from "./indices";
import { dict, LANGS, type Lang } from "./i18n";
import { SITE_URL } from "./site";

/** 지표 페이지의 메타데이터. canonical·hreflang 을 지표 경로에 맞춰 만든다. */
export function indexMetadata(
  id: IndexId,
  lang: Lang,
  opts: { methodology?: boolean } = {},
): Metadata {
  const t = dict(lang);
  const ix = t.indices[id];
  const suffix = `${INDEX_PATH[id]}${opts.methodology ? "methodology/" : ""}`;
  const title = opts.methodology ? `${t.methodologyHeading} — ${ix.title}` : ix.title;
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description: ix.metaDescription,
    alternates: {
      canonical: `/${lang}/${suffix}`,
      languages: {
        ...Object.fromEntries(LANGS.map((l) => [l, `/${l}/${suffix}`])),
        "x-default": `/ko/${suffix}`,
      },
    },
    openGraph: {
      type: "website",
      title,
      description: ix.metaDescription,
      url: `${SITE_URL}/${lang}/${suffix}`,
      locale: lang === "ko" ? "ko_KR" : "en_US",
    },
    twitter: { card: "summary", title, description: ix.metaDescription },
  };
}
