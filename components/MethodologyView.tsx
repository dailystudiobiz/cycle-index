import Link from "next/link";
import { INDEX_PATH, type IndexData, type IndexId } from "@/lib/indices";
import { dict, type Lang } from "@/lib/i18n";
import { dataPath } from "@/lib/site";

/** 지표 한 개의 계산 방법·한계·FAQ. 두 지표가 같은 구조를 쓴다. */
export default function MethodologyView({
  id,
  data,
  lang,
}: {
  id: IndexId;
  data: IndexData;
  lang: Lang;
}) {
  const t = dict(lang);
  const ix = t.indices[id];
  const { meta } = data;
  const locale = lang === "ko" ? "ko-KR" : "en-US";

  return (
    <article className="space-y-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t.methodologyHeading}</h1>
        <p className="mt-1 text-[var(--fg-muted)]">{ix.title}</p>
      </header>

      <section className="space-y-4 leading-relaxed">
        {ix.intro.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t.formulaHeading}</h2>
        <p className="mt-2 mb-4 text-sm text-[var(--fg-muted)] leading-relaxed">{t.formulaIntro}</p>
        <div className="scroll-x">
          <table className="w-full min-w-[480px] text-sm border-collapse">
            <thead>
              <tr className="text-left text-[var(--fg-muted)] border-b border-[var(--border)]">
                <th className="py-2 pr-4 font-medium">{t.componentsHeading}</th>
                <th className="py-2 font-medium text-right">{t.colWeight}</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(meta.weights).map((k) => (
                <tr key={k} className="border-b border-[var(--border)] align-top">
                  <td className="py-3 pr-4">
                    <div className="font-medium">{ix.components[k].label}</div>
                    <p className="mt-1 text-[var(--fg-muted)] leading-relaxed">
                      {ix.components[k].what}
                    </p>
                  </td>
                  <td className="py-3 text-right tnum whitespace-nowrap align-top">
                    {ix.components[k].weight}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t.mappingHeading}</h2>
        <div className="mt-4 space-y-4">
          {ix.mappings.map((mp) => (
            <div key={mp.title}>
              <h3 className="text-sm font-medium">{mp.title}</h3>
              <p className="mt-1 text-sm text-[var(--fg-muted)] leading-relaxed">{mp.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t.dataHeading}</h2>
        <div className="mt-2 space-y-3 text-sm leading-relaxed">
          {ix.dataBody.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p className="text-[var(--fg-muted)] tnum">
            {meta.first_date} ~ {meta.last_date} · {meta.count.toLocaleString(locale)}
          </p>
        </div>
      </section>

      {ix.distributionNote && (
        <section>
          <h2 className="text-lg font-semibold">{t.distributionHeading}</h2>
          <p className="mt-2 text-sm leading-relaxed">{ix.distributionNote}</p>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold">{t.limitsHeading}</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed list-disc pl-5">
          {ix.limits.map((li, i) => (
            <li key={i}>{li}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t.faqHeading}</h2>
        <dl className="mt-4 space-y-5">
          {ix.faq.map((item) => (
            <div key={item.q}>
              <dt className="text-sm font-medium">{item.q}</dt>
              <dd className="mt-1 text-sm text-[var(--fg-muted)] leading-relaxed">{item.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm">
          <a
            href={dataPath(id)}
            download
            className="underline underline-offset-4 hover:text-[var(--fg-muted)]"
          >
            {t.downloadNote} ({id}.json)
          </a>
          <span className="text-[var(--fg-muted)]">
            {" "}
            · {meta.first_date} ~ {meta.last_date} · CC BY 4.0
          </span>
        </p>
      </section>

      <section className="border-t border-[var(--border)] pt-6 text-sm">
        <Link
          href={`/${lang}/${INDEX_PATH[id]}`}
          className="underline underline-offset-4 hover:text-[var(--fg-muted)]"
        >
          {ix.title}
        </Link>
      </section>
    </article>
  );
}
