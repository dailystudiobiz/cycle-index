"use client";

import { useMemo, useState } from "react";
import { downsample, sliceRange, STATE_COLOR, type HistoryPoint } from "@/lib/indices";

const RANGES = ["1y", "5y", "all"] as const;
type Range = (typeof RANGES)[number];

export default function HistoryChart({
  history,
  rangeLabels,
}: {
  history: HistoryPoint[];
  rangeLabels: Record<string, string>;
}) {
  const [range, setRange] = useState<Range>("all");

  const points = useMemo(
    () => downsample(sliceRange(history, range), 900),
    [history, range],
  );

  const W = 1000;
  const H = 300;
  const padL = 34;
  const padR = 8;
  const padT = 10;
  const padB = 26;

  const n = points.length;
  const x = (i: number) => padL + (i / Math.max(1, n - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - v / 100) * (H - padT - padB);

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.k).toFixed(1)}`).join(" ");
  const area = `${line} L ${x(n - 1).toFixed(1)} ${y(0)} L ${x(0).toFixed(1)} ${y(0)} Z`;

  // x축 연도 라벨
  const yearTicks = useMemo(() => {
    const seen = new Set<string>();
    const out: { i: number; label: string }[] = [];
    points.forEach((p, i) => {
      const yr = p.d.slice(0, 4);
      if (!seen.has(yr)) {
        seen.add(yr);
        out.push({ i, label: yr });
      }
    });
    const step = Math.ceil(out.length / 10);
    return out.filter((_, idx) => idx % step === 0);
  }, [points]);

  const last = points[n - 1];

  return (
    <div>
      <div className="flex gap-1 mb-3">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            aria-pressed={range === r}
            className={`px-3 py-1 text-sm rounded border transition-colors ${
              range === r
                ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]"
                : "border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            {rangeLabels[r]}
          </button>
        ))}
      </div>

      <div className="scroll-x">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-w-[560px]" role="img">
          {/* 국면 경계선 */}
          {[25, 50, 75].map((v) => (
            <g key={v}>
              <line
                x1={padL}
                y1={y(v)}
                x2={W - padR}
                y2={y(v)}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text x={4} y={y(v)} fontSize="11" fill="var(--fg-muted)" dominantBaseline="middle" className="tnum">
                {v}
              </text>
            </g>
          ))}
          <text x={4} y={y(100)} fontSize="11" fill="var(--fg-muted)" dominantBaseline="middle" className="tnum">
            100
          </text>
          <text x={4} y={y(0)} fontSize="11" fill="var(--fg-muted)" dominantBaseline="middle" className="tnum">
            0
          </text>

          <defs>
            <linearGradient id="kssArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={STATE_COLOR.overheated} stopOpacity="0.28" />
              <stop offset="50%" stopColor={STATE_COLOR.neutral} stopOpacity="0.12" />
              <stop offset="100%" stopColor={STATE_COLOR.depressed} stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <path d={area} fill="url(#kssArea)" />
          <path d={line} fill="none" stroke="var(--fg)" strokeWidth="1.4" strokeLinejoin="round" />

          {/* 최신값 */}
          <circle cx={x(n - 1)} cy={y(last.k)} r="4" fill={STATE_COLOR[last.s]} />

          {yearTicks.map((t) => (
            <text
              key={t.label}
              x={x(t.i)}
              y={H - 8}
              fontSize="11"
              fill="var(--fg-muted)"
              textAnchor="middle"
              className="tnum"
            >
              {t.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
