"""
KSS (Korea Semiconductor Score) — 전체 이력 소급 계산 파이프라인.

산식을 벡터화해서, 오늘 하루가 아니라 데이터가 존재하는 전 기간에 대해
매 거래일의 KSS를 계산한다.

산식 (froth 0~100, 100 = 과열):
  semi_dev200   30%  삼전·하닉 평균 200일선 이격      score = clamp(50 + dev*(50/40))
  sox_dev200    20%  SOX 200일선 이격                 score = clamp(50 + dev*(50/40))
  semi_dd52     20%  삼전·하닉 평균 52주 고점 낙폭    score = clamp(100 + dd*2)
  semi_ma50     15%  삼전·하닉 50일선 위/아래          score = 70 / 30
  kospi_dev200  15%  KOSPI 200일선 이격               score = clamp(50 + dev*(50/30))

유효한 지표만으로 가중평균하고 가중치는 재정규화한다(원본 동일).

출력: data/kss.json
"""
from __future__ import annotations

import json
import os
from datetime import datetime, timezone

import pandas as pd
import yfinance as yf

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_FILE = os.path.join(BASE, "data", "kss.json")

SEMI_TICKERS = {"005930.KS": "삼성전자", "000660.KS": "SK하이닉스"}
SOX_TICKER = "^SOX"
KOSPI_TICKER = "^KS11"

WEIGHTS = {
    "semi_dev200": 0.30,
    "sox_dev200": 0.20,
    "semi_dd52": 0.20,
    "semi_ma50": 0.15,
    "kospi_dev200": 0.15,
}

# 국면 임계값 — 원본과 동일
STATES = [(75, "overheated"), (50, "extended"), (25, "neutral"), (float("-inf"), "depressed")]


def fetch_closes(ticker: str) -> pd.Series | None:
    """가능한 최대 기간의 일별 종가. 실패 시 None."""
    try:
        h = yf.Ticker(ticker).history(period="max", auto_adjust=True)
    except Exception as exc:  # 네트워크·심볼 오류
        print(f"  x {ticker} 조회 실패: {exc}")
        return None
    if h is None or h.empty:
        print(f"  x {ticker} 빈 응답")
        return None
    s = h["Close"].dropna()
    s.index = pd.to_datetime(s.index).tz_localize(None).normalize()
    s = s[~s.index.duplicated(keep="last")]
    print(f"  o {ticker:<12} {len(s):>6} rows  {s.index[0].date()} ~ {s.index[-1].date()}")
    return s


def dev200(close: pd.Series) -> pd.Series:
    """200일선 이격도 %."""
    ma = close.rolling(200).mean()
    return (close - ma) / ma * 100


def dd52(close: pd.Series) -> pd.Series:
    """52주(252거래일) 고점 대비 낙폭 % (음수)."""
    hi = close.rolling(252, min_periods=20).max()
    return (close - hi) / hi * 100


def above50(close: pd.Series) -> pd.Series:
    """50일선 위=True."""
    return close > close.rolling(50).mean()


def clamp(s: pd.Series, lo: float = 0.0, hi: float = 100.0) -> pd.Series:
    return s.clip(lower=lo, upper=hi)


def score_dev(dev: pd.Series, full: float = 40.0) -> pd.Series:
    """이격 → froth. 0%→50, +full%→100, -full%→0."""
    return clamp(50 + dev * (50.0 / full))


def score_dd(dd: pd.Series) -> pd.Series:
    """낙폭 → froth. 0%→100, -30%→40, -50%→0."""
    return clamp(100 + dd * 2.0)


def score_above50(above: pd.Series) -> pd.Series:
    return above.map({True: 70.0, False: 30.0}).astype("float64")


def classify(kss: float) -> str:
    for threshold, name in STATES:
        if kss >= threshold:
            return name
    return "depressed"


def build() -> dict:
    print("KSS 전체 이력 소급 계산")
    print("-- 가격 수집 --")
    semi = {t: fetch_closes(t) for t in SEMI_TICKERS}
    semi = {t: s for t, s in semi.items() if s is not None}
    sox = fetch_closes(SOX_TICKER)
    kospi = fetch_closes(KOSPI_TICKER)

    if not semi or kospi is None:
        raise SystemExit("필수 시계열(반도체 또는 KOSPI) 확보 실패")

    # 기준 달력: KOSPI 거래일. 해외 지수는 같은 날짜로 정렬 후 직전값 유지.
    calendar = kospi.index

    print("-- 지표 계산 --")
    # 중요: 이동평균·롤링고점은 **각 종목의 자기 거래일 달력**에서 계산해야 한다.
    # 공통 달력에 먼저 맞추면 ffill로 채운 중복값이 롤링 창에 섞여 값이 왜곡된다
    # (KOSPI 거래일과 KR 종목·美 SOX 거래일이 서로 다름).
    semi_dev_parts, semi_dd_parts, semi_a50_parts = [], [], []
    for ticker, close in semi.items():
        semi_dev_parts.append(dev200(close).reindex(calendar).ffill())
        semi_dd_parts.append(dd52(close).reindex(calendar).ffill())
        semi_a50_parts.append(above50(close).reindex(calendar).ffill())

    semi_dev = pd.concat(semi_dev_parts, axis=1).mean(axis=1)
    semi_dd = pd.concat(semi_dd_parts, axis=1).mean(axis=1)
    # 과반이 50일선 위면 True (원본: 비율 > 0.5)
    semi_a50 = pd.concat(semi_a50_parts, axis=1).astype("float64").mean(axis=1) > 0.5

    sox_dev = (
        dev200(sox).reindex(calendar).ffill()
        if sox is not None
        else pd.Series(index=calendar, dtype="float64")
    )
    kospi_dev = dev200(kospi)

    scores = pd.DataFrame(
        {
            "semi_dev200": score_dev(semi_dev),
            "sox_dev200": score_dev(sox_dev),
            "semi_dd52": score_dd(semi_dd),
            "semi_ma50": score_above50(semi_a50),
            "kospi_dev200": score_dev(kospi_dev, full=30.0),
        },
        index=calendar,
    )

    # 유효 지표만 가중평균 + 가중치 재정규화 (원본 로직)
    w = pd.Series(WEIGHTS)
    valid = scores.notna()
    total_w = valid.mul(w, axis=1).sum(axis=1)
    weighted = scores.fillna(0).mul(w, axis=1).sum(axis=1)
    kss = (weighted / total_w).where(total_w > 0)

    raw = pd.DataFrame(
        {
            "semi_dev200_pct": semi_dev,
            "sox_dev200_pct": sox_dev,
            "semi_dd52_pct": semi_dd,
            "kospi_dev200_pct": kospi_dev,
        },
        index=calendar,
    )
    raw["semi_above50"] = semi_a50

    df = pd.DataFrame({"kss": kss}).join(raw).join(scores.add_suffix("_score"))
    # 200일선이 필요하므로 초기 구간은 자연히 결측 — 전 지표가 모인 시점부터 채택
    df = df[df["kss"].notna() & df["semi_dev200_pct"].notna() & df["kospi_dev200_pct"].notna()]
    if df.empty:
        raise SystemExit("계산 결과가 비었음")

    print(f"-- 완료: {len(df)}일  {df.index[0].date()} ~ {df.index[-1].date()} --")

    history = [
        {
            "d": idx.strftime("%Y-%m-%d"),
            "k": round(float(r.kss), 1),
            "s": classify(float(r.kss)),
        }
        for idx, r in df.iterrows()
    ]

    last_idx = df.index[-1]
    last = df.iloc[-1]
    latest = {
        "date": last_idx.strftime("%Y-%m-%d"),
        "kss": round(float(last.kss), 1),
        "state": classify(float(last.kss)),
        "components": [
            {
                "key": key,
                "weight": WEIGHTS[key],
                "score": None if pd.isna(last[f"{key}_score"]) else round(float(last[f"{key}_score"]), 1),
                "raw": _raw_for(key, last),
            }
            for key in WEIGHTS
        ],
    }

    # 분포 참고값 — "지금이 역사적으로 어느 위치인가"
    k = df["kss"]
    percentile = round(float((k <= float(last.kss)).mean() * 100), 1)

    return {
        "meta": {
            "id": "kss",
            "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "first_date": df.index[0].strftime("%Y-%m-%d"),
            "last_date": last_idx.strftime("%Y-%m-%d"),
            "count": len(df),
            "weights": WEIGHTS,
            "tickers": {
                "semiconductor": list(SEMI_TICKERS.keys()),
                "sox": SOX_TICKER,
                "kospi": KOSPI_TICKER,
            },
            "percentile": percentile,
        },
        "latest": latest,
        "history": history,
    }


def _raw_for(key: str, row) -> float | bool | None:
    mapping = {
        "semi_dev200": "semi_dev200_pct",
        "sox_dev200": "sox_dev200_pct",
        "semi_dd52": "semi_dd52_pct",
        "kospi_dev200": "kospi_dev200_pct",
    }
    if key == "semi_ma50":
        return bool(row["semi_above50"])
    val = row[mapping[key]]
    return None if pd.isna(val) else round(float(val), 1)


if __name__ == "__main__":
    payload = build()
    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as fp:
        json.dump(payload, fp, ensure_ascii=False, separators=(",", ":"))
    size_kb = os.path.getsize(OUT_FILE) / 1024
    m = payload["meta"]
    print(f"\n=> {OUT_FILE}  ({size_kb:.0f} KB)")
    print(f"   {m['count']}일  {m['first_date']} ~ {m['last_date']}")
    print(f"   최신 KSS {payload['latest']['kss']} ({payload['latest']['state']}) / 역사적 백분위 {m['percentile']}%")
