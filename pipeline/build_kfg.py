"""
KFG (Korea Fear & Greed) — KOSPI 기반 투자심리 프록시, 전체 이력 소급 계산.

한국에는 공식 공포·탐욕 지수가 없다. CNN 지수의 구성을 KOSPI 가격만으로
재현할 수 있는 세 축으로 옮긴 프록시다. 0 = 극단적 공포, 100 = 극단적 탐욕
(CNN과 같은 방향).

구성:
  모멘텀     40%  KOSPI 125일선 이격. ±12% 를 0~100 으로 (CNN market momentum 대응)
  52주 위치  30%  최근 52주 레인지 안에서 현재가의 위치 (신고가/신저가 강도 대응)
  변동성     30%  20일 실현변동성의 1년 백분위의 역수 (낮은 변동 = 탐욕)

변동성 항목을 백분위로 쓰는 이유: 변동성의 절대 수준은 시대마다 다르다.
2008년의 '평온'과 2017년의 '평온'은 수치가 전혀 다르므로, 절대값을 쓰면
과거 구간 전체가 한쪽으로 쏠린다. 직전 1년 대비 상대 위치로 보면 국면이
바뀌어도 같은 의미를 유지한다.

출력: data/kfg.json
"""
from __future__ import annotations

import os

import pandas as pd

from common import DATA_DIR, clamp, fetch_closes, freeze_published, rolling_percentile, write

OUT_FILE = os.path.join(DATA_DIR, "kfg.json")

KOSPI_TICKER = "^KS11"

WEIGHTS = {"momentum": 0.40, "range52w": 0.30, "volatility": 0.30}

# 라벨 경계 — 한쪽으로 치우치지 않도록 중립을 45~55 로 좁게 둔다.
STATES = [
    (75, "extreme_greed"),
    (55, "greed"),
    (45, "neutral"),
    (25, "fear"),
    (float("-inf"), "extreme_fear"),
]

MOMENTUM_FULL = 12.0  # 125일선 이격 ±12% 를 0~100 끝값으로


def classify(v: float) -> str:
    for threshold, name in STATES:
        if v >= threshold:
            return name
    return "extreme_fear"


def build() -> dict:
    print("KFG 전체 이력 소급 계산")
    print("-- 가격 수집 --")
    kospi = fetch_closes(KOSPI_TICKER)
    if kospi is None:
        raise SystemExit("KOSPI 시계열 확보 실패")

    print("-- 지표 계산 --")
    # 1) 모멘텀 — 125일선 이격
    ma125 = kospi.rolling(125).mean()
    dev125 = (kospi - ma125) / ma125 * 100
    momentum = clamp(50 + dev125 * (50.0 / MOMENTUM_FULL))

    # 2) 52주 레인지 내 위치
    lo52 = kospi.rolling(252).min()
    hi52 = kospi.rolling(252).max()
    span = hi52 - lo52
    range52w = clamp(((kospi - lo52) / span * 100).where(span > 0, 50.0))

    # 3) 변동성 — 20일 실현변동성(연율)의 1년 백분위 역수
    vol20 = kospi.pct_change().rolling(20).std() * (252**0.5) * 100
    vol_pctile = rolling_percentile(vol20, 252)
    volatility = clamp(100 - vol_pctile)

    scores = pd.DataFrame(
        {"momentum": momentum, "range52w": range52w, "volatility": volatility}
    )
    w = pd.Series(WEIGHTS)
    valid = scores.notna()
    total_w = valid.mul(w, axis=1).sum(axis=1)
    weighted = scores.fillna(0).mul(w, axis=1).sum(axis=1)
    kfg = (weighted / total_w).where(valid.all(axis=1))

    raw = pd.DataFrame(
        {
            "momentum_dev125_pct": dev125,
            "range52w_pos_pct": range52w,
            "vol20_annual_pct": vol20,
            "vol_percentile": vol_pctile,
        }
    )

    df = pd.DataFrame({"v": kfg}).join(raw).join(scores.add_suffix("_score"))
    df = df[df["v"].notna()]
    if df.empty:
        raise SystemExit("계산 결과가 비었음")

    print(f"-- 완료: {len(df)}일  {df.index[0].date()} ~ {df.index[-1].date()} --")

    history = [
        {"d": idx.strftime("%Y-%m-%d"), "k": round(float(r.v), 1), "s": classify(float(r.v))}
        for idx, r in df.iterrows()
    ]

    last_idx, last = df.index[-1], df.iloc[-1]
    raw_keys = {
        "momentum": "momentum_dev125_pct",
        "range52w": "range52w_pos_pct",
        "volatility": "vol_percentile",
    }
    return {
        "meta": {
            "id": "kfg",
            "first_date": df.index[0].strftime("%Y-%m-%d"),
            "last_date": last_idx.strftime("%Y-%m-%d"),
            "count": len(df),
            "weights": WEIGHTS,
            "tickers": {"kospi": KOSPI_TICKER},
            "percentile": round(float((df["v"] <= float(last.v)).mean() * 100), 1),
        },
        "latest": {
            "date": last_idx.strftime("%Y-%m-%d"),
            "value": round(float(last.v), 1),
            "state": classify(float(last.v)),
            "components": [
                {
                    "key": key,
                    "weight": WEIGHTS[key],
                    "score": round(float(last[f"{key}_score"]), 1),
                    "raw": round(float(last[raw_keys[key]]), 1),
                }
                for key in WEIGHTS
            ],
        },
        "history": history,
    }


if __name__ == "__main__":
    write(freeze_published(build(), OUT_FILE), OUT_FILE)
