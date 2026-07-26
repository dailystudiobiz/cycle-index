"""
KFG 국면별 '이후 KOSPI 등락' 분포.

흔히 "공포탐욕지수 백테스트"라고 부르는 질문 — 공포 구간이었을 때 그 뒤 시장이
어떻게 됐나 — 의 원자료다. 한국 시장 기준으로 이 계산을 공개한 곳이 없어서
(2026-07 확인) 검색해도 미국 지수 결과나 증권사 PDF만 나온다.

**전략을 시험하지 않는다.** 매수·매도 시점을 가정하고 수익률을 내면 그건 투자
권유가 된다. 여기서 내는 것은 "그 국면이었던 날들의 이후 등락이 실제로 어떻게
분포했는가"라는 서술 통계뿐이다. 비용·세금·배당을 반영하지 않으며 어떤 행동도
권하지 않는다.

정직하게 밝혀야 하는 것:
  - 구간이 겹친다. 20일 뒤 수익률을 매일 계산하면 이웃한 관측이 같은 날들을
    공유하므로 n이 커 보여도 독립 표본이 아니다. 그래서 연속 국면을 하나로
    묶은 '국면 수'(episodes)를 함께 낸다. 이게 실질 표본 크기에 가깝다.
  - 극단 구간은 국면 수가 한 자릿수인 경우가 있다. 중앙값이 몇 개 사건에
    좌우된다는 뜻이라 표에 그대로 드러낸다.

출력: data/kfg_forward.json
"""
from __future__ import annotations

import json
import os

import pandas as pd

from common import DATA_DIR, fetch_closes, write_json

OUT_FILE = os.path.join(DATA_DIR, "kfg_forward.json")
KFG_FILE = os.path.join(DATA_DIR, "kfg.json")

KOSPI_TICKER = "^KS11"

# 거래일 기준. 20 ≈ 1개월, 60 ≈ 3개월, 120 ≈ 6개월, 250 ≈ 1년.
HORIZONS = [20, 60, 120, 250]

# kfg.json 의 state 값. 표시 순서를 여기서 고정한다(공포 → 탐욕).
STATES = ["extreme_fear", "fear", "neutral", "greed", "extreme_greed"]


def episodes(states: pd.Series, target: str) -> int:
    """연속으로 같은 국면이었던 구간의 개수. 겹치는 관측의 실질 표본 크기 근사."""
    is_target = states == target
    return int((is_target & ~is_target.shift(1, fill_value=False)).sum())


def build() -> dict:
    print("KFG 국면별 이후 KOSPI 등락 분포")

    with open(KFG_FILE, encoding="utf-8") as fp:
        kfg = json.load(fp)
    hist = pd.DataFrame(kfg["history"])
    hist["d"] = pd.to_datetime(hist["d"])
    hist = hist.set_index("d").sort_index()
    print(f"-- KFG 게시본 {len(hist)}일  {hist.index[0].date()} ~ {hist.index[-1].date()} --")

    print("-- 가격 수집 --")
    kospi = fetch_closes(KOSPI_TICKER)
    if kospi is None:
        raise SystemExit("KOSPI 시계열 확보 실패")

    # KFG는 KOSPI에서 파생되므로 날짜가 일치해야 한다. 어긋나면 조용히 넘기지 않는다.
    px = kospi.reindex(hist.index)
    missing = int(px.isna().sum())
    if missing:
        print(f"  ! KFG {missing}일에 대응하는 KOSPI 종가 없음 — 해당 일자 제외")
        keep = px.notna()
        hist, px = hist[keep], px[keep]

    print("-- 구간별 집계 --")
    buckets = []
    for state in STATES:
        mask = hist["s"] == state
        n_days = int(mask.sum())
        if n_days == 0:
            continue
        row = {
            "state": state,
            "days": n_days,
            "episodes": episodes(hist["s"], state),
            "horizons": {},
        }
        for h in HORIZONS:
            fwd = (px.shift(-h) / px - 1.0) * 100.0
            v = fwd[mask].dropna()
            if len(v) == 0:
                continue
            row["horizons"][str(h)] = {
                "n": int(len(v)),
                "median": round(float(v.median()), 1),
                "mean": round(float(v.mean()), 1),
                "p25": round(float(v.quantile(0.25)), 1),
                "p75": round(float(v.quantile(0.75)), 1),
                "min": round(float(v.min()), 1),
                "max": round(float(v.max()), 1),
                "positive": round(float((v > 0).mean() * 100), 1),
            }
        buckets.append(row)
        h60 = row["horizons"].get("60")
        if h60:
            print(
                f"  {state:<13} {n_days:>5}일 / {row['episodes']:>3}국면"
                f"  60일뒤 중앙값 {h60['median']:>6}%  상승비율 {h60['positive']:>5}%"
            )

    # 비교 기준선 — 국면을 가리지 않은 전체 기간의 같은 통계.
    baseline = {}
    for h in HORIZONS:
        fwd = ((px.shift(-h) / px - 1.0) * 100.0).dropna()
        baseline[str(h)] = {
            "n": int(len(fwd)),
            "median": round(float(fwd.median()), 1),
            "positive": round(float((fwd > 0).mean() * 100), 1),
        }

    return {
        "meta": {
            "id": "kfg_forward",
            "source_index": "kfg",
            "ticker": KOSPI_TICKER,
            "first_date": hist.index[0].strftime("%Y-%m-%d"),
            "last_date": hist.index[-1].strftime("%Y-%m-%d"),
            "count": len(hist),
            "horizons": HORIZONS,
        },
        "baseline": baseline,
        "buckets": buckets,
    }


if __name__ == "__main__":
    payload = build()
    write_json(payload, OUT_FILE)
