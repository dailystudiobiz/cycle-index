import MethodologyView from "@/components/MethodologyView";
import { loadIndex } from "@/lib/data";
import { LANGS, isLang, type Lang } from "@/lib/i18n";
import { indexMetadata } from "@/lib/meta";

const ID = "kfg" as const;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return indexMetadata(ID, isLang(lang) ? lang : "ko", { methodology: true });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "ko";
  return <MethodologyView id={ID} data={loadIndex(ID)} lang={l} />;
}
