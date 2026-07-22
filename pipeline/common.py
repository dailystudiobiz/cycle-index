"""
지표 파이프라인 공통 모듈.

가격 수집과 게시본 동결은 지표마다 똑같이 필요하고, 둘 다 상류(Yahoo)의
불안정성에 대응하는 코드라 한곳에 모아둔다.
"""
from __future__ import annotations

import json
import os
import time

import pandas as pd
import yfinance as yf

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE, "data")

# 마지막 거래일이 오늘로부터 이 일수 안이면 정상으로 보고 재시도하지 않는다.
# 주말(금 종가 → 월요일 실행)을 덮을 만큼 넉넉하게 잡는다.
FRESH_DAYS = 4


def _history(ticker: str, period: str) -> pd.Series | None:
    try:
        h = yf.Ticker(ticker).history(period=period, auto_adjust=True)
    except Exception as exc:  # 네트워크·심볼 오류
        print(f"  x {ticker} ({period}) 조회 실패: {exc}")
        return None
    if h is None or h.empty:
        return None
    s = h["Close"].dropna()
    s.index = pd.to_datetime(s.index).tz_localize(None).normalize()
    return s[~s.index.duplicated(keep="last")]


def _fetch_once(ticker: str) -> pd.Series | None:
    """max 응답과 최근 구간을 합쳐 한 번 가져온다."""
    full = _history(ticker, "max")
    recent = _history(ticker, "3mo")
    if full is None and recent is None:
        return None
    if full is None:
        return recent
    if recent is None:
        return full
    # 겹치는 구간은 최근 응답을 채택한다(더 나중에 확정된 값).
    return pd.concat([full[~full.index.isin(recent.index)], recent]).sort_index()


def fetch_closes(ticker: str, attempts: int = 2, pause: float = 2.0) -> pd.Series | None:
    """
    전 기간 일별 종가. **확정 종가만** 쓴다.

    Yahoo는 당일 장 마감 직후에도 종가를 비워둔 채(NaN) 행만 먼저 내놓는다.
    _history 의 dropna 가 이를 걸러내므로 아직 정산되지 않은 날은 자연히 제외된다.
    (장중에 조회하면 잠정가가 실값처럼 들어오므로 파이프라인은 반드시 양 시장
     마감 뒤에 돌려야 한다 — update.sh 주석 참고.)

    별개로 period="max" 응답이 최근 구간을 통째로 빠뜨리는 경우가 있어
    max + 최근 구간을 합치고, 결과가 눈에 띄게 오래됐을 때만 한 번 더 시도한다.
    """
    best: pd.Series | None = None
    for i in range(attempts):
        s = _fetch_once(ticker)
        if s is not None and (best is None or s.index[-1] > best.index[-1]):
            if best is not None:
                print(f"    ↳ {ticker}: 재시도에서 {best.index[-1].date()} → {s.index[-1].date()} 로 보강")
            best = s
        if best is not None and (pd.Timestamp.today().normalize() - best.index[-1]).days <= FRESH_DAYS:
            break
        if i < attempts - 1:
            time.sleep(pause)

    if best is None:
        print(f"  x {ticker} 데이터 없음")
        return None
    print(f"  o {ticker:<12} {len(best):>6} rows  {best.index[0].date()} ~ {best.index[-1].date()}")
    return best


def clamp(s: pd.Series, lo: float = 0.0, hi: float = 100.0) -> pd.Series:
    return s.clip(lower=lo, upper=hi)


def rolling_percentile(series: pd.Series, window: int = 252) -> pd.Series:
    """각 시점에서 직전 window 구간 대비 현재값의 백분위(0~100)."""
    return series.rolling(window).apply(
        lambda w: (w[:-1] < w[-1]).mean() * 100 if len(w) > 1 else 50.0,
        raw=True,
    )


def freeze_published(payload: dict, out_file: str) -> dict:
    """
    이미 게시한 날짜의 값은 그대로 둔다.

    상류 가격이 사후에 미세하게 조정되면 과거 값이 반올림 경계에서 ±0.1 뒤집히는
    것을 실측했다(KSS 2017-10-19: 76.5 ↔ 76.6). 게시된 지수가 조용히 바뀌면
    어제 본 차트와 오늘 본 차트가 달라진다. 그래서 새로 계산한 값은 **아직
    게시되지 않은 날짜에만** 반영하고 기존 날짜는 보존한다.
    """
    if not os.path.exists(out_file):
        return payload
    try:
        with open(out_file, encoding="utf-8") as fp:
            prev = json.load(fp)
    except (json.JSONDecodeError, OSError):
        return payload

    published = {row["d"]: row for row in prev.get("history", [])}
    if not published:
        return payload

    kept = changed = added = 0
    merged = []
    for row in payload["history"]:
        old = published.get(row["d"])
        if old is None:
            merged.append(row)
            added += 1
        else:
            if old["k"] != row["k"]:
                changed += 1
            merged.append(old)
            kept += 1

    payload["history"] = merged
    if changed:
        print(f"-- 게시본 보존: 재계산이 과거 {changed}일을 바꾸려 했으나 기존 값 유지 --")
    if added:
        print(f"-- 신규 {added}일 추가 (보존 {kept}일) --")

    if merged:
        last = merged[-1]
        if payload["latest"]["date"] == last["d"]:
            payload["latest"]["value"] = last["k"]
            payload["latest"]["state"] = last["s"]
        ks = [r["k"] for r in merged]
        payload["meta"]["percentile"] = round(
            sum(1 for k in ks if k <= last["k"]) / len(ks) * 100, 1
        )
    return payload


def write(payload: dict, out_file: str) -> None:
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as fp:
        json.dump(payload, fp, ensure_ascii=False, separators=(",", ":"))
    m = payload["meta"]
    size_kb = os.path.getsize(out_file) / 1024
    print(f"\n=> {out_file}  ({size_kb:.0f} KB)")
    print(f"   {m['count']}일  {m['first_date']} ~ {m['last_date']}")
    print(f"   최신 {payload['latest']['value']} ({payload['latest']['state']}) / 백분위 {m['percentile']}%")
