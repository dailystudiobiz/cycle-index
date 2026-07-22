import { loadKss } from "@/lib/data";
import { LANGS, dict, isLang, type ComponentKey, type Lang } from "@/lib/i18n";
import { DATA_PATH } from "@/lib/site";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = dict(isLang(lang) ? lang : "ko");
  return { title: t.methodology.heading, description: t.metaDescription };
}

export default async function MethodologyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "ko";
  const t = dict(l);
  const { meta } = loadKss();
  const m = t.methodology;

  return (
    <article className="space-y-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{m.heading}</h1>
      </header>

      <section className="space-y-4 leading-relaxed">
        {m.intro.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-semibold">{m.formulaHeading}</h2>
        <p className="mt-2 mb-4 text-sm text-[var(--fg-muted)] leading-relaxed">
          {m.formulaIntro}
        </p>
        <div className="scroll-x">
          <table className="w-full min-w-[480px] text-sm border-collapse">
            <thead>
              <tr className="text-left text-[var(--fg-muted)] border-b border-[var(--border)]">
                <th className="py-2 pr-4 font-medium">{t.componentsHeading}</th>
                <th className="py-2 font-medium text-right">{t.colWeight}</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(meta.weights) as ComponentKey[]).map((k) => (
                <tr key={k} className="border-b border-[var(--border)] align-top">
                  <td className="py-3 pr-4">
                    <div className="font-medium">{t.components[k].label}</div>
                    <p className="mt-1 text-[var(--fg-muted)] leading-relaxed">
                      {t.components[k].what}
                    </p>
                  </td>
                  <td className="py-3 text-right tnum whitespace-nowrap align-top">
                    {t.components[k].weight}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{m.mappingHeading}</h2>
        <div className="mt-4 space-y-4">
          {m.mappings.map((mp) => (
            <div key={mp.title}>
              <h3 className="text-sm font-medium">{mp.title}</h3>
              <p className="mt-1 text-sm text-[var(--fg-muted)] leading-relaxed">{mp.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{m.dataHeading}</h2>
        <div className="mt-2 space-y-3 text-sm leading-relaxed">
          {m.dataBody.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p className="text-[var(--fg-muted)] tnum">
            {meta.first_date} ~ {meta.last_date} · {meta.count.toLocaleString(l === "ko" ? "ko-KR" : "en-US")}
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{m.limitsHeading}</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed list-disc pl-5">
          {m.limits.map((li, i) => (
            <li key={i}>{li}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t.faq.heading}</h2>
        <dl className="mt-4 space-y-5">
          {t.faq.items.map((item) => (
            <div key={item.q}>
              <dt className="text-sm font-medium">{item.q}</dt>
              <dd className="mt-1 text-sm text-[var(--fg-muted)] leading-relaxed">{item.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm">
          <a
            href={DATA_PATH}
            download
            className="underline underline-offset-4 hover:text-[var(--fg-muted)]"
          >
            kss.json
          </a>
          <span className="text-[var(--fg-muted)]">
            {" "}
            · {meta.first_date} ~ {meta.last_date} · CC BY 4.0
          </span>
        </p>
      </section>
    </article>
  );
}
