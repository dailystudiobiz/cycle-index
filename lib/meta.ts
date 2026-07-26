import type { Metadata } from "next";
import { INDEX_PATH, type IndexId } from "./indices";
import { dict, LANGS, type Lang } from "./i18n";
import { SITE_URL } from "./site";

/** 지표 페이지의 메타데이터. canonical·hreflang 을 지표 경로에 맞춰 만든다. */
export function indexMetadata(
  id: IndexId,
  lang: Lang,
  opts: { methodology?: boolean; cycles?: { from: string; to: string } } = {},
): Metadata {
  const t = dict(lang);
  const ix = t.indices[id];
  const sub = opts.methodology ? "methodology/" : opts.cycles ? "cycles/" : "";
  const suffix = `${INDEX_PATH[id]}${sub}`;
  const title = opts.methodology
    ? `${t.methodologyHeading} — ${ix.title}`
    : opts.cycles
      ? t.cycles.title(ix.title)
      : ix.title;
  const description = opts.cycles
    ? t.cycles.metaDescription(opts.cycles.from, opts.cycles.to)
    : ix.metaDescription;
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
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
      description,
      url: `${SITE_URL}/${lang}/${suffix}`,
      locale: lang === "ko" ? "ko_KR" : "en_US",
    },
    twitter: { card: "summary", title, description },
  };
}
