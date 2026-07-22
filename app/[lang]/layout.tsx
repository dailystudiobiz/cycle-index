import Link from "next/link";
import type { Metadata } from "next";
import { LANGS, dict, isLang, otherLang, type Lang } from "@/lib/i18n";
import { loadKss } from "@/lib/data";
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
    title: { default: `${t.siteName} · KSS`, template: `%s · ${t.siteName}` },
    description: t.metaDescription,
    alternates: {
      canonical: `/${l}/`,
      languages: { ko: "/ko/", en: "/en/", "x-default": "/ko/" },
    },
    openGraph: {
      type: "website",
      siteName: t.siteName,
      title: t.siteName,
      description: t.metaDescription,
      url: `${SITE_URL}/${l}/`,
      locale: l === "ko" ? "ko_KR" : "en_US",
    },
    twitter: { card: "summary", title: t.siteName, description: t.metaDescription },
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
  const { meta } = loadKss();

  return (
    <html lang={l}>
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-[var(--border)]">
          <div className="mx-auto max-w-4xl px-4 py-3 flex items-center gap-4">
            <Link href={`/${l}/`} className="font-semibold tracking-tight">
              {t.siteName}
            </Link>
            <nav className="flex gap-4 text-sm text-[var(--fg-muted)] ml-auto">
              <Link href={`/${l}/`} className="hover:text-[var(--fg)]">
                {t.nav.index}
              </Link>
              <Link href={`/${l}/methodology/`} className="hover:text-[var(--fg)]">
                {t.nav.methodology}
              </Link>
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
              {t.footerUpdated}: {meta.last_date}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
