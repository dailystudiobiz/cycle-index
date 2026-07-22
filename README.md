# SemiCycle

Cycle indices for the Korean equity market, published daily at
**[semicycleindex.com](https://semicycleindex.com)** in Korean and English.

Every formula, weight and limitation is published. The full history of each index
is downloadable as JSON under CC BY 4.0.

## Indices

| Index | What it measures | Record |
|---|---|---|
| **KSS** — [Korea Semiconductor Cycle](https://semicycleindex.com/en/) | How far Samsung Electronics and SK hynix trade from their own long-term trend, combined with SOX and KOSPI | 6,352 trading days from 2000-10-09 |
| **KFG** — [KOSPI Fear & Greed](https://semicycleindex.com/en/fear-greed/) | Market sentiment inferred from KOSPI momentum, position in the 52-week range, and realised volatility | 7,016 trading days from 1998-01-30 |

Both run 0–100. Neither is a trading signal — they measure where prices *are*,
not where they are going.

## Why the history is backfilled

Most published gauges of this kind begin the day they launch, which leaves them
with nothing to compare against for years. Because these indices use only price
data, the same formula can be applied to the entire available record. That is what
makes a statement like *"today sits in the top 20% of readings since 2000"*
possible on day one.

## Two rules the pipeline enforces

**Only settled closes are used.** Yahoo emits a row for the current session with a
null close before it settles. Computing intraday picks up a provisional price and
publishes it as if it were a close. The job therefore runs after both the Korean
and US markets have closed, and null closes are dropped rather than filled.

**A published value is never revised.** Upstream price revisions can flip a value
sitting on a rounding boundary — one 2017 reading moved between 76.5 and 76.6
across consecutive runs of identical code. An index that silently changes is worse
than one that lags, so historical values are frozen once written and only
unpublished dates are appended.

## Layout

```
pipeline/
  common.py       price fetching, publish-freeze, shared scoring helpers
  build_kss.py    Korea Semiconductor Cycle
  build_kfg.py    KOSPI Fear & Greed
data/             one JSON per index — the published record
app/[lang]/       Next.js static export, Korean and English
update.sh         daily: recompute, commit only on change, push
```

The site is a static export. A push of changed data triggers a rebuild and deploy.

## Running it

```bash
pip install yfinance pandas
npm install

python3 pipeline/build_kss.py    # writes data/kss.json
python3 pipeline/build_kfg.py    # writes data/kfg.json
npm run dev
```

## Data

- [`kss.json`](https://semicycleindex.com/data/kss.json)
- [`kfg.json`](https://semicycleindex.com/data/kfg.json)

```json
{
  "meta":   { "id": "kss", "first_date": "...", "last_date": "...", "count": 6352, "weights": {...}, "percentile": 79.6 },
  "latest": { "date": "...", "value": 73.1, "state": "extended", "components": [...] },
  "history":[ { "d": "2000-10-09", "k": 22.8, "s": "depressed" }, ... ]
}
```

Licensed CC BY 4.0 — attribution appreciated.

## Disclaimer

Published for information only. These are reference measures derived from public
price data by fixed formulas. They are not investment advice, do not recommend
buying or selling any security, and guarantee no outcome. Neither is an official
index; neither is produced by an exchange or index provider.
