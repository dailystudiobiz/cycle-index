import Link from "next/link";
import type { Metadata } from "next";
import { BRAND, LANGS, dict, isLang, otherLang, type Lang } from "@/lib/i18n";
import { INDEX_IDS, INDEX_PATH, loadIndex } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "ko";
  const t = dict(l);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: BRAND, template: `%s · ${BRAND}` },
    description: t.tagline,
    openGraph: { siteName: BRAND },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "ko";
  const t = dict(l);
  const other = otherLang(l);
  const lastUpdated = INDEX_IDS.map((i) => loadIndex(i).meta.last_date).sort().at(-1);

  return (
    <html lang={l}>
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-[var(--border)]">
          <div className="mx-auto max-w-4xl px-4 py-3 flex items-center gap-4">
            <Link href={`/${l}/`} className="font-semibold tracking-tight shrink-0">
              {BRAND}
            </Link>
            <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--fg-muted)] ml-auto">
              {INDEX_IDS.map((id) => (
                <Link
                  key={id}
                  href={`/${l}/${INDEX_PATH[id]}`}
                  className="hover:text-[var(--fg)]"
                >
                  {t.indices[id].short}
                </Link>
              ))}
              <Link href={`/${other}/`} className="hover:text-[var(--fg)]" hrefLang={other}>
                {t.langSwitch}
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 mx-auto max-w-4xl px-4 py-8 w-full">{children}</main>

        <footer className="border-t border-[var(--border)] mt-12">
          <div className="mx-auto max-w-4xl px-4 py-6 text-xs text-[var(--fg-muted)] space-y-2">
            <p>{t.disclaimer}</p>
            <p className="tnum">
              {t.footerUpdated}: {lastUpdated}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
