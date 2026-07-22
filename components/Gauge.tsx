import { STATE_COLOR } from "@/lib/kss";
import type { StateKey } from "@/lib/i18n";

/** 0~100을 반원 게이지로 표시. 서버 렌더링되는 순수 SVG(스크립트 없음). */
export default function Gauge({
  value,
  state,
  label,
}: {
  value: number;
  state: StateKey;
  label: string;
}) {
  const W = 320;
  const H = 180;
  const cx = W / 2;
  const cy = 160;
  const r = 130;
  const stroke = 22;

  const polar = (pct: number, radius: number) => {
    const angle = Math.PI * (1 - pct / 100);
    return [cx + radius * Math.cos(angle), cy - radius * Math.sin(angle)] as const;
  };

  // 국면 구간별 호(0-25, 25-50, 50-75, 75-100)
  const bands: { from: number; to: number; key: StateKey }[] = [
    { from: 0, to: 25, key: "depressed" },
    { from: 25, to: 50, key: "neutral" },
    { from: 50, to: 75, key: "extended" },
    { from: 75, to: 100, key: "overheated" },
  ];

  const arc = (from: number, to: number) => {
    const [x1, y1] = polar(from, r);
    const [x2, y2] = polar(to, r);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };

  const [nx, ny] = polar(value, r - stroke / 2 - 6);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full max-w-[320px] h-auto"
      role="img"
      aria-label={`${label} ${value.toFixed(1)}`}
    >
      {bands.map((b) => (
        <path
          key={b.key}
          d={arc(b.from, b.to)}
          fill="none"
          stroke={STATE_COLOR[b.key]}
          strokeWidth={stroke}
          strokeLinecap="butt"
          opacity={b.key === state ? 1 : 0.22}
        />
      ))}

      {/* 눈금 */}
      {[0, 25, 50, 75, 100].map((t) => {
        const [tx, ty] = polar(t, r + stroke / 2 + 12);
        return (
          <text
            key={t}
            x={tx}
            y={ty}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fill="var(--fg-muted)"
            className="tnum"
          >
            {t}
          </text>
        );
      })}

      {/* 지침 */}
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke="var(--fg)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="7" fill="var(--fg)" />

      <text
        x={cx}
        y={cy - 44}
        textAnchor="middle"
        fontSize="46"
        fontWeight="700"
        fill="var(--fg)"
        className="tnum"
      >
        {value.toFixed(1)}
      </text>
    </svg>
  );
}
