#!/usr/bin/env bash
# 매일 1회: 지표 재계산 → 정적 사이트 재빌드.
# 한국 증시 종가 확정 후에 돌린다. 예) crontab: 30 16 * * 1-5
set -euo pipefail

cd "$(dirname "$0")"

echo "[$(date '+%F %T')] 지표 재계산"
python3 pipeline/build_kss.py


echo "[$(date '+%F %T')] 사이트 빌드"
npm run build

echo "[$(date '+%F %T')] 완료 -> out/"
