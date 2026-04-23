#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#  ArabaIQ — end-to-end smoke test
#
#  Production URL'ler üzerinden canary isteği atar. Local makinede çalışır.
#
#  Kullanım:
#    ./deploy/verify.sh                   # arabaiq.com
#    BASE=https://staging.arabaiq.com ./deploy/verify.sh
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

BASE="${BASE:-https://arabaiq.com}"

c_bold=$'\033[1m'; c_green=$'\033[32m'; c_yellow=$'\033[33m'
c_red=$'\033[31m'; c_reset=$'\033[0m'
pass()   { echo "${c_green}  ✓${c_reset} $*"; }
note()   { echo "${c_yellow}  ·${c_reset} $*"; }
fail_n() { echo "${c_red}  ✗${c_reset} $*"; FAILED=$((FAILED+1)); }

FAILED=0

echo "${c_bold}ArabaIQ smoke test → $BASE${c_reset}"

# ── DNS ──────────────────────────────────────────────────────────────────
echo
echo "${c_bold}DNS${c_reset}"
HOST="${BASE#https://}"; HOST="${HOST#http://}"; HOST="${HOST%%/*}"
if out="$(dig +short "$HOST" 2>/dev/null)"; then
  if [[ -n "$out" ]]; then
    pass "$HOST çözümleniyor"
    echo "$out" | sed 's/^/       /'
  else
    fail_n "$HOST DNS yanıt vermedi"
  fi
else
  note "dig yok, atlandı"
fi

# ── HTTP endpoints ───────────────────────────────────────────────────────
echo
echo "${c_bold}HTTP endpoints${c_reset}"

check() {
  local label="$1" url="$2" expect="$3"
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "$url" 2>/dev/null || echo 000)"
  if [[ "$code" =~ ^$expect$ ]]; then
    pass "$label  [$code]  $url"
  else
    fail_n "$label  [$code beklenen: $expect]  $url"
  fi
}

check "apex redirect"    "$BASE"              "200|30[0-9]"
check "tr homepage"      "$BASE/tr"           "200"
check "en homepage"      "$BASE/en"           "200"
check "recommendations"  "$BASE/tr/recommendations" "200"
check "compare"          "$BASE/tr/compare"   "200"
check "api health"       "$BASE/health"       "200"
check "api segments"     "$BASE/api/cars/segments" "200"

# ── Content spot-check ───────────────────────────────────────────────────
echo
echo "${c_bold}Content spot-check${c_reset}"
if html="$(curl -sS --max-time 10 "$BASE/tr" 2>/dev/null)"; then
  if echo "$html" | grep -qi "arabaiq\|araba ?iq"; then
    pass "homepage marka adı geçiyor"
  else
    fail_n "homepage beklenen markayı içermiyor"
  fi
fi

if json="$(curl -sS --max-time 10 "$BASE/api/cars/segments" 2>/dev/null)"; then
  count="$(echo "$json" | tr ',' '\n' | grep -c '"code"' || true)"
  if [[ "$count" -gt 0 ]]; then
    pass "segments endpoint $count segment döndü"
  else
    fail_n "segments endpoint boş veya JSON değil"
  fi
fi

# ── CI durumu ────────────────────────────────────────────────────────────
echo
echo "${c_bold}GitHub Actions${c_reset}"
if command -v gh >/dev/null 2>&1; then
  if gh run list --limit 1 --workflow deploy.yml 2>/dev/null | head -1; then
    pass "son deploy run'ı görünür"
  else
    note "son deploy run'ı listelenemedi"
  fi
else
  note "gh CLI yok"
fi

echo
if [[ "$FAILED" -eq 0 ]]; then
  echo "${c_bold}${c_green}✓ Smoke test temiz${c_reset}"
  exit 0
else
  echo "${c_bold}${c_red}✗ $FAILED kontrol başarısız${c_reset}"
  exit 1
fi
