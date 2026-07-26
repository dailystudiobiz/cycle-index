import Link from "next/link";
import { INDEX_PATH } from "@/lib/indices";
import { DETAIL_HORIZON, type ForwardData } from "@/lib/forward";
import { dict, type Lang } from "@/lib/i18n";
import { dataPath } from "@/lib/site";

const ID = "kfg" as const;

/** 본문 문구의 **강조**만 굵게 만든다. 마크다운 전체를 지원할 이유는 없다. */
function Emphasis({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>,
      )}
    </>
  );
}

/** 부호에 따라 색을 준다. 0 근처를 회색으로 두면 표가 훨씬 빨리 읽힌다. */
function signed(v: number) {
  const color = v > 0 ? "#dc2626" : v < 0 ? "#2563eb" : "var(--fg-muted)";
  return (
    <span style={{ color }} className="tnum">
      {v > 0 ? "+" : ""}
      {v.toFixed(1)}%
    </span>
  );
}

export default function ForwardView({ data, lang }: { data: ForwardData; lang: Lang }) {
  const t = dict(lang);
  const f = t.forward;
  const states = t.indices[ID].states;
  const { meta, baseline, buckets } = data;
  const horizons = meta.horizons.map(String);
  const locale = lang === "ko" ? "ko-KR" : "en-US";

  const label = (state: string) => states[state]?.label ?? state;
  const at = (state: string) => buckets.find((b) => b.state === state)?.horizons[DETAIL_HORIZON];

  const ranked = buckets
    .filter((b) => b.horizons[DETAIL_HORIZON])
    .sort((a, b) => a.horizons[DETAIL_HORIZON].median - b.horizons[DETAIL_HORIZON].median);
  const worst = ranked[0];
  const thinnest = [...buckets].sort((a, b) => a.episodes - b.episodes)[0];

  return (
    <article className="space-y-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{f.title}</h1>
        <p className="mt-3 leading-relaxed">
          {f.lead({ from: meta.first_date, to: meta.last_date, days: meta.count })}
        </p>
        <p className="mt-3 text-sm text-[var(--fg-muted)] leading-relaxed border-l-2 border-[var(--border)] pl-4">
          {f.notStrategy}
        </p>
      </header>

      <section>
        <h2 className="text-lg font-semibold">{f.medianHeading}</h2>
        <p className="mt-2 mb-4 text-sm text-[var(--fg-muted)] leading-relaxed">{f.medianIntro}</p>
        <div className="scroll-x">
          <table className="w-full min-w-[480px] text-sm border-collapse">
            <thead>
              <tr className="text-left text-[var(--fg-muted)] border-b border-[var(--border)]">
                <th className="py-2 pr-4 font-medium">{f.colState}</th>
                {meta.horizons.map((h) => (
                  <th key={h} className="py-2 pl-4 font-medium text-right whitespace-nowrap">
                    {f.horizonLabel(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buckets.map((b) => (
                <tr key={b.state} className="border-b border-[var(--border)]">
                  <td className="py-2 pr-4 whitespace-nowrap">{label(b.state)}</td>
                  {horizons.map((h) => (
                    <td key={h} className="py-2 pl-4 text-right">
                      {b.horizons[h] ? signed(b.horizons[h].median) : "—"}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-b border-[var(--border)] text-[var(--fg-muted)]">
                <td className="py-2 pr-4 whitespace-nowrap">{f.baselineLabel}</td>
                {horizons.map((h) => (
                  <td key={h} className="py-2 pl-4 text-right tnum">
                    {baseline[h] ? `${baseline[h].median.toFixed(1)}%` : "—"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{f.positiveHeading}</h2>
        <p className="mt-2 mb-4 text-sm text-[var(--fg-muted)] leading-relaxed">{f.positiveIntro}</p>
        <div className="scroll-x">
          <table className="w-full min-w-[480px] text-sm border-collapse">
            <thead>
              <tr className="text-left text-[var(--fg-muted)] border-b border-[var(--border)]">
                <th className="py-2 pr-4 font-medium">{f.colState}</th>
                {meta.horizons.map((h) => (
                  <th key={h} className="py-2 pl-4 font-medium text-right whitespace-nowrap">
                    {f.horizonLabel(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buckets.map((b) => (
                <tr key={b.state} className="border-b border-[var(--border)]">
                  <td className="py-2 pr-4 whitespace-nowrap">{label(b.state)}</td>
                  {horizons.map((h) => (
                    <td key={h} className="py-2 pl-4 text-right tnum">
                      {b.horizons[h] ? `${b.horizons[h].positive.toFixed(1)}%` : "—"}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-b border-[var(--border)] text-[var(--fg-muted)]">
                <td className="py-2 pr-4 whitespace-nowrap">{f.baselineLabel}</td>
                {horizons.map((h) => (
                  <td key={h} className="py-2 pl-4 text-right tnum">
                    {baseline[h] ? `${baseline[h].positive.toFixed(1)}%` : "—"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{f.spreadHeading(DETAIL_HORIZON)}</h2>
        <p className="mt-2 mb-4 text-sm text-[var(--fg-muted)] leading-relaxed">{f.spreadIntro}</p>
        <div className="scroll-x">
          <table className="w-full min-w-[640px] text-sm border-collapse">
            <thead>
              <tr className="text-left text-[var(--fg-muted)] border-b border-[var(--border)]">
                <th className="py-2 pr-4 font-medium">{f.colState}</th>
                <th className="py-2 pl-4 font-medium text-right">{f.colDays}</th>
                <th className="py-2 pl-4 font-medium text-right">{f.colEpisodes}</th>
                <th className="py-2 pl-4 font-medium text-right">{f.colP25}</th>
                <th className="py-2 pl-4 font-medium text-right">{f.colMedian}</th>
                <th className="py-2 pl-4 font-medium text-right">{f.colP75}</th>
                <th className="py-2 pl-4 font-medium text-right">{f.colMin}</th>
                <th className="py-2 pl-4 font-medium text-right">{f.colMax}</th>
              </tr>
            </thead>
            <tbody>
              {buckets.map((b) => {
                const s = b.horizons[DETAIL_HORIZON];
                return (
                  <tr key={b.state} className="border-b border-[var(--border)]">
                    <td className="py-2 pr-4 whitespace-nowrap">{label(b.state)}</td>
                    <td className="py-2 pl-4 text-right tnum">{b.days.toLocaleString(locale)}</td>
                    <td className="py-2 pl-4 text-right tnum">{b.episodes}</td>
                    <td className="py-2 pl-4 text-right">{s ? signed(s.p25) : "—"}</td>
                    <td className="py-2 pl-4 text-right">{s ? signed(s.median) : "—"}</td>
                    <td className="py-2 pl-4 text-right">{s ? signed(s.p75) : "—"}</td>
                    <td className="py-2 pl-4 text-right">{s ? signed(s.min) : "—"}</td>
                    <td className="py-2 pl-4 text-right">{s ? signed(s.max) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{f.readingHeading}</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed list-disc pl-5">
          {f
            .readings({
              worstState: label(worst.state),
              worstMedian: worst.horizons[DETAIL_HORIZON].median,
              fearMedian: at("extreme_fear")?.median ?? 0,
              greedMedian: at("extreme_greed")?.median ?? 0,
              baseMedian: baseline[DETAIL_HORIZON]?.median ?? 0,
              horizon: DETAIL_HORIZON,
            })
            .map((line, i) => (
              <li key={i}>
                <Emphasis text={line} />
              </li>
            ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{f.limitsHeading}</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed list-disc pl-5">
          {f
            .limits({ minEpisodes: thinnest.episodes, minEpisodeState: label(thinnest.state) })
            .map((line, i) => (
              <li key={i}>
                <Emphasis text={line} />
              </li>
            ))}
        </ul>
        <p className="mt-6 text-sm">
          <a
            href={dataPath(ID)}
            download
            className="underline underline-offset-4 hover:text-[var(--fg-muted)]"
          >
            {t.downloadNote} (kfg.json)
          </a>
          <span className="text-[var(--fg-muted)]">
            {" "}
            · {meta.first_date} ~ {meta.last_date} · CC BY 4.0
          </span>
        </p>
      </section>

      <section className="border-t border-[var(--border)] pt-6 text-sm flex flex-wrap gap-x-6 gap-y-2">
        <Link
          href={`/${lang}/${INDEX_PATH[ID]}`}
          className="underline underline-offset-4 hover:text-[var(--fg-muted)]"
        >
          {t.indices[ID].title}
        </Link>
        <Link
          href={`/${lang}/${INDEX_PATH[ID]}methodology/`}
          className="underline underline-offset-4 hover:text-[var(--fg-muted)]"
        >
          {t.methodologyHeading}
        </Link>
      </section>
    </article>
  );
}
