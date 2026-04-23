#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#  ArabaIQ — Cloudflare automation
#
#  Zone ayarlarını Cloudflare API ile tek hamlede yapılandırır:
#    - DNS A record'u:  arabaiq.com, www.arabaiq.com → $VPS_IP (proxied=true)
#    - SSL mode:        flexible   (browser↔CF HTTPS, CF↔VPS HTTP)
#    - Always HTTPS:    on         (HTTP gelenleri HTTPS'e çevir)
#    - Auto HTTPS Rewrites: on
#    - Min TLS: 1.2
#
#  Ön koşul — Cloudflare API token üret:
#    https://dash.cloudflare.com/profile/api-tokens → Create Token
#    "Edit zone DNS" template, Zone Resources = arabaiq.com
#    Ek olarak: Zone → SSL and Certificates → Edit izni (aynı token'da)
#
#  Kullanım:
#    export CF_API_TOKEN="...."
#    export VPS_IP="1.2.3.4"
#    ./deploy/setup-cloudflare.sh
#
#  Custom domain:
#    DOMAIN=example.com ./deploy/setup-cloudflare.sh
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

DOMAIN="${DOMAIN:-arabaiq.com}"
CF_API="https://api.cloudflare.com/client/v4"

c_bold=$'\033[1m'; c_green=$'\033[32m'; c_yellow=$'\033[33m'
c_red=$'\033[31m'; c_blue=$'\033[34m'; c_reset=$'\033[0m'
step() { echo; echo "${c_bold}${c_blue}▶ $*${c_reset}"; }
ok()   { echo "${c_green}  ✓${c_reset} $*"; }
warn() { echo "${c_yellow}  ⚠${c_reset} $*"; }
fail() { echo "${c_red}  ✗${c_reset} $*" >&2; exit 1; }

command -v jq   >/dev/null 2>&1 || fail "jq yok (brew install jq)"
command -v curl >/dev/null 2>&1 || fail "curl yok"

: "${CF_API_TOKEN:?CF_API_TOKEN env var lazım}"
: "${VPS_IP:?VPS_IP env var lazım}"

cf() {
  local method="$1" path="$2"; shift 2
  curl -fsS -X "$method" "${CF_API}${path}" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" \
    "$@"
}

# ── Zone id ───────────────────────────────────────────────────────────────
step "Zone id for $DOMAIN"
ZONE_ID="$(cf GET "/zones?name=${DOMAIN}" | jq -r '.result[0].id')"
[[ "$ZONE_ID" != "null" && -n "$ZONE_ID" ]] || fail "Zone bulunamadı — token'ın bu zone'a erişimi var mı?"
ok "zone_id = $ZONE_ID"

# ── DNS records ──────────────────────────────────────────────────────────
upsert_a_record() {
  local name="$1" ip="$2"
  local existing
  existing="$(cf GET "/zones/${ZONE_ID}/dns_records?type=A&name=${name}" | jq -r '.result[0].id // empty')"
  local payload
  payload="$(jq -n --arg n "$name" --arg c "$ip" \
    '{type:"A", name:$n, content:$c, ttl:1, proxied:true}')"
  if [[ -n "$existing" ]]; then
    cf PUT "/zones/${ZONE_ID}/dns_records/${existing}" --data "$payload" >/dev/null
    ok "A $name → $ip (güncellendi, proxied)"
  else
    cf POST "/zones/${ZONE_ID}/dns_records" --data "$payload" >/dev/null
    ok "A $name → $ip (yeni, proxied)"
  fi
}

step "DNS A records"
upsert_a_record "$DOMAIN"      "$VPS_IP"
upsert_a_record "www.$DOMAIN"  "$VPS_IP"

# ── SSL mode ─────────────────────────────────────────────────────────────
step "SSL mode: flexible"
cf PATCH "/zones/${ZONE_ID}/settings/ssl" \
  --data '{"value":"flexible"}' >/dev/null
ok "flexible"

# ── Always use HTTPS ─────────────────────────────────────────────────────
step "Always Use HTTPS: on"
cf PATCH "/zones/${ZONE_ID}/settings/always_use_https" \
  --data '{"value":"on"}' >/dev/null
ok "on"

# ── Auto HTTPS rewrites ──────────────────────────────────────────────────
step "Auto HTTPS Rewrites: on"
cf PATCH "/zones/${ZONE_ID}/settings/automatic_https_rewrites" \
  --data '{"value":"on"}' >/dev/null
ok "on"

# ── Min TLS ──────────────────────────────────────────────────────────────
step "Min TLS: 1.2"
cf PATCH "/zones/${ZONE_ID}/settings/min_tls_version" \
  --data '{"value":"1.2"}' >/dev/null
ok "1.2"

echo
echo "${c_bold}${c_green}✓ Cloudflare ayarlandı${c_reset}"
echo
echo "  Doğrulama:"
echo "    dig +short $DOMAIN     # CF IP'leri dönmeli (104.x / 172.x)"
echo "    curl -sI https://$DOMAIN | head -1   # HTTP/2 200 veya 301"
echo
