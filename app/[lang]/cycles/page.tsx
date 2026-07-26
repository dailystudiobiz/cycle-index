import CyclesView from "@/components/CyclesView";
import CyclesJsonLd from "@/components/CyclesJsonLd";
import { loadIndex } from "@/lib/data";
import { LANGS, isLang, type Lang } from "@/lib/i18n";
import { indexMetadata } from "@/lib/meta";

const ID = "kss" as const;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const { meta } = loadIndex(ID);
  return indexMetadata(ID, isLang(lang) ? lang : "ko", {
    cycles: { from: meta.first_date, to: meta.last_date },
  });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "ko";
  const data = loadIndex(ID);
  return (
    <>
      <CyclesJsonLd id={ID} data={data} lang={l} />
      <CyclesView id={ID} data={data} lang={l} />
    </>
  );
}
