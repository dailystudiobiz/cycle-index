import ForwardView from "@/components/ForwardView";
import ForwardJsonLd from "@/components/ForwardJsonLd";
import { loadForward } from "@/lib/data";
import { LANGS, isLang, type Lang } from "@/lib/i18n";
import { indexMetadata } from "@/lib/meta";

const ID = "kfg" as const;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const { meta } = loadForward();
  return indexMetadata(ID, isLang(lang) ? lang : "ko", {
    outcomes: { from: meta.first_date, to: meta.last_date },
  });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "ko";
  const data = loadForward();
  return (
    <>
      <ForwardJsonLd data={data} lang={l} />
      <ForwardView data={data} lang={l} />
    </>
  );
}
