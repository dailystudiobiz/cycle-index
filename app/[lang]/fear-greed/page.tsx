import IndexView from "@/components/IndexView";
import IndexJsonLd from "@/components/IndexJsonLd";
import { loadIndex } from "@/lib/data";
import { isLang, type Lang } from "@/lib/i18n";
import { indexMetadata } from "@/lib/meta";
import { LANGS } from "@/lib/i18n";

const ID = "kfg" as const;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return indexMetadata(ID, isLang(lang) ? lang : "ko");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "ko";
  const data = loadIndex(ID);
  return (
    <>
      <IndexJsonLd id={ID} data={data} lang={l} />
      <IndexView id={ID} data={data} lang={l} />
    </>
  );
}
