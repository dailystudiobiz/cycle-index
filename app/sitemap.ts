import type { MetadataRoute } from "next";
import { LANGS } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { loadKss } from "@/lib/data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const { meta } = loadKss();
  const lastModified = new Date(meta.last_date);

  const paths = ["", "methodology/"];
  return LANGS.flatMap((lang) =>
    paths.map((p) => ({
      url: `${SITE_URL}/${lang}/${p}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: p === "" ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          LANGS.map((l) => [l, `${SITE_URL}/${l}/${p}`]),
        ),
      },
    })),
  );
}
