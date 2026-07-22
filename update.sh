#!/usr/bin/env bash
# 매일 1회: 지표 재계산 → 변경 시에만 커밋·푸시 → Cloudflare Pages 자동 재빌드.
#
# 실행 시각: 한국시간 오전 7시 (crontab: 0 7 * * *)
#   한국 장 마감(15:30 KST) 직후가 아니라 **미국 장 마감 이후**에 돌린다.
#   SOX는 한국보다 늦게 닫으므로, 한국 종가 직후에 계산하면 그 날짜의 SOX가
#   아직 없어 전일 값이 쓰이고, 다음 날 재계산하면 이미 게시한 숫자가 바뀐다.
#   미국 마감 후에 돌려야 소급 계산 이력과 동일한 산식이 되고 값이 확정된다.
#
# 빌드는 여기서 하지 않는다. data/kss.json 을 푸시하면 Cloudflare Pages가
# npm run build (prebuild가 public/data로 복사) 를 돌려 배포한다.
set -euo pipefail

cd "$(dirname "$0")"

log() { echo "[$(date '+%F %T')] $*"; }

# 게시 중인 마지막 날짜를 먼저 기억해둔다 (후퇴 감지용)
PREV_DATE=$(python3 -c "import json;print(json.load(open('data/kss.json'))['latest']['date'])" 2>/dev/null || echo "")

log "지표 재계산"
python3 pipeline/build_kss.py

if git diff --quiet -- data/kss.json; then
  log "변동 없음 (거래일 아님 또는 값 동일) — 종료"
  exit 0
fi

NEW_DATE=$(python3 -c "import json;print(json.load(open('data/kss.json'))['latest']['date'])")

# 후퇴 방지 — 상류(Yahoo) 데이터가 최근 거래일을 누락하는 일이 실제로 있었다.
# 이미 게시한 날짜보다 과거로 가는 결과는 절대 배포하지 않고 원복한다.
if [ -n "$PREV_DATE" ] && [ "$NEW_DATE" \< "$PREV_DATE" ]; then
  log "중단: 계산 결과가 $PREV_DATE → $NEW_DATE 로 후퇴함. 상류 데이터 결손으로 판단해 원복."
  git checkout -- data/kss.json
  exit 1
fi

NEW_KSS=$(python3 -c "import json;print(json.load(open('data/kss.json'))['latest']['kss'])")
log "갱신: $NEW_DATE  KSS=$NEW_KSS"

git add data/kss.json
git -c user.name="DailyStudio" -c user.email="dailystudiobiz@gmail.com" \
    commit -q -m "data: KSS $NEW_DATE = $NEW_KSS"
git push -q origin main

log "푸시 완료 — Cloudflare Pages 재빌드 시작됨"
