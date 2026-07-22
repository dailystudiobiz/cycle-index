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

INDICES="kss kfg"

last_date() { python3 -c "import json;print(json.load(open('data/$1.json'))['latest']['date'])" 2>/dev/null || echo ""; }
latest_val() { python3 -c "import json;print(json.load(open('data/$1.json'))['latest']['value'])"; }

CHANGED=""
for ix in $INDICES; do
  PREV=$(last_date "$ix")

  log "[$ix] 재계산"
  python3 "pipeline/build_${ix}.py" | sed "s/^/  /"

  if git diff --quiet -- "data/$ix.json"; then
    log "[$ix] 변동 없음"
    continue
  fi

  NEW=$(last_date "$ix")

  # 후퇴 방지 — 상류(Yahoo)가 최근 거래일을 누락하거나 미정산 종가를 비워두는 일이
  # 실제로 있었다. 이미 게시한 날짜보다 과거로 가는 결과는 배포하지 않고 원복한다.
  if [ -n "$PREV" ] && [ "$NEW" \< "$PREV" ]; then
    log "[$ix] 중단: $PREV → $NEW 로 후퇴함. 상류 데이터 결손으로 판단해 원복."
    git checkout -- "data/$ix.json"
    continue
  fi

  log "[$ix] 갱신: $NEW = $(latest_val "$ix")"
  git add "data/$ix.json"
  CHANGED="$CHANGED $ix"
done

if [ -z "$CHANGED" ]; then
  log "전 지표 변동 없음 — 종료"
  exit 0
fi

MSG="data:$(for ix in $CHANGED; do printf " %s %s=%s" "$ix" "$(last_date "$ix")" "$(latest_val "$ix")"; done)"
git -c user.name="DailyStudio" -c user.email="dailystudiobiz@gmail.com" commit -q -m "$MSG"
git push -q origin main

log "푸시 완료 — Cloudflare Pages 재빌드 시작됨"
