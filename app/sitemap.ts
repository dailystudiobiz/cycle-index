import type { MetadataRoute } from "next";
import { LANGS } from "@/lib/i18n";
import { INDEX_IDS, INDEX_PATH, loadIndex } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return LANGS.flatMap((lang) =>
    INDEX_IDS.flatMap((id) => {
      const lastModified = new Date(loadIndex(id).meta.last_date);
      const base = INDEX_PATH[id];
      return [
        { path: base, priority: id === "kss" ? 1 : 0.9 },
        { path: `${base}methodology/`, priority: 0.7 },
      ].map(({ path, priority }) => ({
        url: `${SITE_URL}/${lang}/${path}`,
        lastModified,
        changeFrequency: "daily" as const,
        priority,
        alternates: {
          languages: Object.fromEntries(LANGS.map((l) => [l, `${SITE_URL}/${l}/${path}`])),
        },
      }));
    }),
  );
}
