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

# 파생 분석은 원본 지표가 바뀐 뒤에만 다시 낸다.
# kfg_forward 는 게시된 kfg.json 을 읽으므로 반드시 KFG 재계산 **후**에 돌려야 한다.
case " $CHANGED " in
  *" kfg "*)
    log "[kfg_forward] 국면별 이후 등락 재계산"
    python3 pipeline/build_kfg_forward.py | sed "s/^/  /"
    git add "data/kfg_forward.json"
    ;;
esac

MSG="data:$(for ix in $CHANGED; do printf " %s %s=%s" "$ix" "$(last_date "$ix")" "$(latest_val "$ix")"; done)"
git -c user.name="DailyStudio" -c user.email="dailystudiobiz@gmail.com" commit -q -m "$MSG"
git push -q origin main

log "푸시 완료 — Cloudflare Pages 재빌드 시작됨"

# ── IndexNow ────────────────────────────────────────────────────────────────
# 구글 Search Console 의 수동 색인 요청은 하루 할당량이 있어 매일 쓸 수 없다.
# IndexNow 는 할당량 없이 Bing·**네이버**·Yandex·Seznam 에 한 번에 통보한다.
# 네이버는 외부 사이트를 잘 안 띄우지만, 최소한 색인은 되어야 AI 브리핑 출처로도 걸린다.
#
# 키는 비밀이 아니다 — public/<key>.txt 로 공개 서빙되는 것이 규격상 요구사항이다.
# 재빌드가 끝나기 전에 통보하면 크롤러가 옛 페이지를 볼 수 있어 잠시 기다린다.
INDEXNOW_KEY="8420822e413136ce4ad5a1f7d8736a75"
HOST="semicycleindex.com"

log "Cloudflare Pages 배포 대기 (90초)"
sleep 90

URLS=$(curl -s --max-time 20 "https://${HOST}/sitemap.xml" \
  | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g')

if [ -z "$URLS" ]; then
  log "IndexNow 건너뜀: 사이트맵을 읽지 못함"
else
  PAYLOAD=$(python3 -c "
import json, sys
urls = [u.strip() for u in sys.stdin if u.strip()]
print(json.dumps({'host': '$HOST', 'key': '$INDEXNOW_KEY', 'urlList': urls}))
" <<< "$URLS")

  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 \
    -X POST "https://api.indexnow.org/indexnow" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d "$PAYLOAD")
  # 200 = 접수, 202 = 접수했으나 키 검증 대기. 둘 다 정상이다.
  log "IndexNow 통보: HTTP $CODE ($(wc -l <<< "$URLS")건)"
fi
