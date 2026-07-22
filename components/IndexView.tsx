import Link from "next/link";
import Gauge from "@/components/Gauge";
import HistoryChart from "@/components/HistoryChart";
import { INDEX_BANDS, INDEX_PATH, INDEX_IDS, STATE_COLOR, type IndexData, type IndexId } from "@/lib/indices";
import { dict, type Lang } from "@/lib/i18n";

/** 지표 한 개의 대시보드. 두 지표가 같은 구조를 쓰므로 한 컴포넌트로 묶는다. */
export default function IndexView({
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
  const { meta, latest, history } = data;
  const state = ix.states[latest.state];
  const bands = INDEX_BANDS[id];
  const others = INDEX_IDS.filter((o) => o !== id);

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">{ix.title}</h1>
        <p className="mt-1 text-[var(--fg-muted)]">{ix.tagline}</p>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-6">
        <h2 className="text-sm font-medium text-[var(--fg-muted)]">{t.today}</h2>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-6">
          <Gauge value={latest.value} state={latest.state} bands={bands} label={ix.title} />
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

      <section>
        <h2 className="text-lg font-semibold">{t.historyHeading}</h2>
        <p className="mt-1 mb-4 text-sm text-[var(--fg-muted)] leading-relaxed">
          {t.historyIntro(meta.first_date, meta.last_date, meta.count)}
        </p>
        <HistoryChart history={history} rangeLabels={t.rangeLabels} />
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t.componentsHeading}</h2>
        <p className="mt-1 mb-4 text-sm text-[var(--fg-muted)] leading-relaxed">{t.componentsIntro}</p>

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
                const info = ix.components[c.key];
                const raw =
                  typeof c.raw === "boolean"
                    ? c.raw
                      ? t.yes
                      : t.no
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

      <section>
        <h2 className="text-lg font-semibold">{t.bandsHeading}</h2>
        <dl className="mt-4 space-y-3">
          {[...bands].reverse().map((b) => (
            <div key={b.key} className="flex gap-3">
              <span
                className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: STATE_COLOR[b.key] }}
                aria-hidden
              />
              <div>
                <dt className="text-sm font-medium">
                  {ix.states[b.key].label}{" "}
                  <span className="font-normal text-[var(--fg-muted)] tnum">
                    ({ix.states[b.key].band})
                  </span>
                </dt>
                <dd className="text-sm text-[var(--fg-muted)] leading-relaxed">
                  {ix.states[b.key].meaning}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-wrap gap-x-6 gap-y-2 text-sm border-t border-[var(--border)] pt-6">
        <Link
          href={`/${lang}/${INDEX_PATH[id]}methodology/`}
          className="underline underline-offset-4 hover:text-[var(--fg-muted)]"
        >
          {t.methodologyHeading}
        </Link>
        {others.map((o) => (
          <Link
            key={o}
            href={`/${lang}/${INDEX_PATH[o]}`}
            className="underline underline-offset-4 hover:text-[var(--fg-muted)]"
          >
            {t.indices[o].title}
          </Link>
        ))}
      </section>
    </div>
  );
}
