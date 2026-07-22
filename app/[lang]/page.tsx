import Gauge from "@/components/Gauge";
import HistoryChart from "@/components/HistoryChart";
import { loadKss, STATE_COLOR } from "@/lib/data";
import { dict, isLang, type ComponentKey, type Lang } from "@/lib/i18n";
import { SITE_URL, DATA_PATH } from "@/lib/site";

export default async function IndexPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "ko";
  const t = dict(l);
  const { meta, latest, history } = loadKss();
  const state = t.states[latest.state];

  // 구조화 데이터 — 검색엔진·AI가 "무엇을 재는 지표이고 데이터가 어디 있는지" 읽게 한다.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: t.siteName,
    description: t.metaDescription,
    url: `${SITE_URL}/${l}/`,
    inLanguage: l,
    temporalCoverage: `${meta.first_date}/${meta.last_date}`,
    dateModified: meta.last_date,
    isAccessibleForFree: true,
    license: "https://creativecommons.org/licenses/by/4.0/",
    creator: { "@type": "Organization", name: "DailyStudio" },
    variableMeasured: {
      "@type": "PropertyValue",
      name: "KSS",
      description: t.tagline,
      minValue: 0,
      maxValue: 100,
      value: latest.kss,
    },
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: `${SITE_URL}${DATA_PATH}`,
    },
  };

  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section>
        <h1 className="text-2xl font-bold tracking-tight">{t.siteName}</h1>
        <p className="mt-1 text-[var(--fg-muted)]">{t.tagline}</p>
      </section>

      {/* 오늘의 지수 */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
        <h2 className="text-sm font-medium text-[var(--fg-muted)]">{t.today}</h2>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-6">
          <Gauge value={latest.kss} state={latest.state} label={t.scoreLabel} />
          <div className="flex-1 space-y-3">
            <div>
              <span
                className="inline-block rounded px-2 py-0.5 text-sm font-semibold text-white"
                style={{ backgroundColor: STATE_COLOR[latest.state] }}
              >
                {state.label}
              </span>
              <span className="ml-2 text-sm text-[var(--fg-muted)] tnum">{state.band}</span>
            </div>
            <p className="text-sm leading-relaxed">{state.meaning}</p>
            <p className="text-sm text-[var(--fg-muted)] tnum">
              {t.asOf} {latest.date} · {t.percentile(meta.percentile)}
            </p>
            <p className="text-xs text-[var(--fg-muted)]">{t.percentileHelp}</p>
          </div>
        </div>
      </section>

      {/* 전체 이력 */}
      <section>
        <h2 className="text-lg font-semibold">{t.historyHeading}</h2>
        <p className="mt-1 mb-4 text-sm text-[var(--fg-muted)] leading-relaxed">
          {t.historyIntro(meta.first_date, meta.last_date, meta.count)}
        </p>
        <HistoryChart history={history} rangeLabels={t.rangeLabels} />
      </section>

      {/* 구성 지표 */}
      <section>
        <h2 className="text-lg font-semibold">{t.componentsHeading}</h2>
        <p className="mt-1 mb-4 text-sm text-[var(--fg-muted)] leading-relaxed">
          {t.componentsIntro}
        </p>

        <div className="scroll-x">
          <table className="w-full min-w-[520px] text-sm border-collapse">
            <thead>
              <tr className="text-left text-[var(--fg-muted)] border-b border-[var(--border)]">
                <th className="py-2 pr-4 font-medium">{t.componentsHeading}</th>
                <th className="py-2 pr-4 font-medium text-right">{t.colWeight}</th>
                <th className="py-2 pr-4 font-medium text-right">{t.colRaw}</th>
                <th className="py-2 font-medium text-right">{t.colScore}</th>
              </tr>
            </thead>
            <tbody>
              {latest.components.map((c) => {
                const info = t.components[c.key as ComponentKey];
                const raw =
                  typeof c.raw === "boolean"
                    ? c.raw
                      ? t.above50.yes
                      : t.above50.no
                    : c.raw === null
                      ? "—"
                      : `${c.raw > 0 ? "+" : ""}${c.raw}%`;
                return (
                  <tr key={c.key} className="border-b border-[var(--border)] align-top">
                    <td className="py-3 pr-4">
                      <div className="font-medium">{info.label}</div>
                      <p className="mt-1 text-[var(--fg-muted)] leading-relaxed">{info.what}</p>
                    </td>
                    <td className="py-3 pr-4 text-right tnum whitespace-nowrap">{info.weight}</td>
                    <td className="py-3 pr-4 text-right tnum whitespace-nowrap">{raw}</td>
                    <td className="py-3 text-right tnum whitespace-nowrap">
                      {c.score === null ? "—" : c.score.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 국면 구분 */}
      <section>
        <h2 className="text-lg font-semibold">{t.bandsHeading}</h2>
        <dl className="mt-4 space-y-3">
          {(["overheated", "extended", "neutral", "depressed"] as const).map((k) => (
            <div key={k} className="flex gap-3">
              <span
                className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: STATE_COLOR[k] }}
                aria-hidden
              />
              <div>
                <dt className="text-sm font-medium">
                  {t.states[k].label}{" "}
                  <span className="font-normal text-[var(--fg-muted)] tnum">
                    ({t.states[k].band})
                  </span>
                </dt>
                <dd className="text-sm text-[var(--fg-muted)] leading-relaxed">
                  {t.states[k].meaning}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
