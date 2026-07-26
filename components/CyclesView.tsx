import Link from "next/link";
import { INDEX_PATH, type IndexData, type IndexId } from "@/lib/indices";
import { rankByDays, summarizeCycles, type CycleRun } from "@/lib/cycles";
import { dict, type Lang } from "@/lib/i18n";
import { dataPath } from "@/lib/site";

/** 구간을 나눌 때 쓴 기준값. lib/cycles.ts 의 상수와 같은 값을 설명용으로만 다시 적는다. */
const MIN_RUN_DAYS = 15;
const MAX_GAP_DAYS = 10;

function RunTable({
  runs,
  extremeLabel,
  t,
}: {
  runs: CycleRun[];
  extremeLabel: string;
  t: ReturnType<typeof dict>;
}) {
  const c = t.cycles;
  return (
    <div className="scroll-x">
      <table className="w-full min-w-[520px] text-sm border-collapse">
        <thead>
          <tr className="text-left text-[var(--fg-muted)] border-b border-[var(--border)]">
            <th className="py-2 pr-4 font-medium">{c.colPeriod}</th>
            <th className="py-2 pr-4 font-medium text-right">{c.colDays}</th>
            <th className="py-2 pr-4 font-medium text-right">{extremeLabel}</th>
            <th className="py-2 font-medium text-right">{c.colRecovery}</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.start} className="border-b border-[var(--border)]">
              <td className="py-2 pr-4 tnum whitespace-nowrap">
                {r.start} – {r.ongoing ? c.ongoingLabel : r.end}
              </td>
              <td className="py-2 pr-4 text-right tnum">{c.daysUnit(r.days)}</td>
              <td className="py-2 pr-4 text-right tnum whitespace-nowrap">
                {r.extreme}{" "}
                <span className="text-[var(--fg-muted)]">({r.extremeDate})</span>
              </td>
              <td className="py-2 text-right tnum whitespace-nowrap">
                {r.recoveryDays !== null ? (
                  c.daysUnit(r.recoveryDays)
                ) : (
                  <span className="text-[var(--fg-muted)]">
                    {r.ongoing ? c.ongoingLabel : c.notRecovered}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 역대 사이클 구간을 한 장에 정리한 페이지.
 *
 * 지수 페이지가 "오늘 몇 점"이라면 여기는 "그 점수가 역사에서 어디쯤"에 답한다.
 * 표의 모든 숫자는 이력에서 매 빌드 다시 계산되므로 손으로 고칠 것이 없다.
 */
export default function CyclesView({
  id,
  data,
  lang,
}: {
  id: IndexId;
  data: IndexData;
  lang: Lang;
}) {
  const t = dict(lang);
  const c = t.cycles;
  const ix = t.indices[id];
  const s = summarizeCycles(id, data);
  const { meta } = data;

  const longest = [...s.hot].sort((a, b) => b.days - a.days)[0];
  const yearsSinceCold = s.lastColdEnd
    ? Math.floor(
        (new Date(meta.last_date).getTime() - new Date(s.lastColdEnd).getTime()) /
          (365.25 * 24 * 3600 * 1000),
      )
    : null;

  return (
    <article className="space-y-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{c.title(ix.title)}</h1>
        <p className="mt-3 leading-relaxed">
          {c.lead({
            from: meta.first_date,
            to: meta.last_date,
            days: meta.count,
            hot: s.hot.length,
            cold: s.cold.length,
          })}
        </p>
      </header>

      <section>
        <h2 className="text-lg font-semibold">{c.nowHeading}</h2>
        <p className="mt-2 leading-relaxed">
          {s.ongoingHot
            ? c.nowOngoing({
                days: s.ongoingHot.days,
                since: s.ongoingHot.start,
                until: s.ongoingHot.end,
                rank: rankByDays(s.hot, s.ongoingHot),
                latest: data.latest.value,
                latestDate: data.latest.date,
                // 짧은 이탈을 이어 붙이므로 "진행 중"인 구간이라도 오늘 값이
                // 기준선 아래일 수 있다. 그 경우를 뭉뚱그리면 사실과 어긋난다.
                inBand: data.latest.value >= s.hotThreshold,
              })
            : c.nowSettled({ latest: data.latest.value, latestDate: data.latest.date })}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">{c.hotHeading(s.hotThreshold)}</h2>
        <RunTable runs={s.hot} extremeLabel={c.colPeak} t={t} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">{c.coldHeading(s.coldThreshold)}</h2>
        {s.cold.length ? (
          <RunTable runs={s.cold} extremeLabel={c.colTrough} t={t} />
        ) : (
          <p className="text-sm text-[var(--fg-muted)]">{c.emptyCold}</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">{c.readingHeading}</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed list-disc pl-5">
          {c
            .readings({
              high: s.allTimeHigh,
              low: s.allTimeLow,
              medianRecovery: s.medianRecoveryDays,
              lastColdEnd: s.lastColdEnd,
              yearsSinceCold,
              longest: { days: longest.days, start: longest.start, end: longest.end },
            })
            .map((line, i) => (
              <li key={i}>{line}</li>
            ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{c.howHeading}</h2>
        <div className="mt-2 space-y-3 text-sm leading-relaxed">
          {c
            .how({
              hot: s.hotThreshold,
              cold: s.coldThreshold,
              minDays: MIN_RUN_DAYS,
              gap: MAX_GAP_DAYS,
            })
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
        <p className="mt-4 text-sm">
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

      <section className="border-t border-[var(--border)] pt-6 text-sm flex flex-wrap gap-x-6 gap-y-2">
        <Link
          href={`/${lang}/${INDEX_PATH[id]}`}
          className="underline underline-offset-4 hover:text-[var(--fg-muted)]"
        >
          {ix.title}
        </Link>
        <Link
          href={`/${lang}/${INDEX_PATH[id]}methodology/`}
          className="underline underline-offset-4 hover:text-[var(--fg-muted)]"
        >
          {t.methodologyHeading}
        </Link>
      </section>
    </article>
  );
}
