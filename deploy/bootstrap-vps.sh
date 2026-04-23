#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#  ArabaIQ — VPS bootstrap (one-shot)
#
#  Bu script VPS'te tek bir sefer root olarak çalıştırılır. Şunları yapar:
#    1. Docker + compose plugin kurar (yoksa)
#    2. /opt/arabaiq klasörünü oluşturur, repo'yu clone'lar (veya pull'lar)
#    3. .env.production dosyasını etkileşimli oluşturur (DB pw auto-generate)
#    4. Stack'i ilk kez build + up eder
#    5. Alembic migration'larını bekler, seed çalıştırır (opsiyonel)
#    6. nginx site config'i kopyalar, Cloudflare IP listesini çeker, reload eder
#    7. GitHub Actions için deploy SSH key üretir ve ekrana basar
#
#  Kullanım:
#    ssh root@VPS_IP
#    curl -fsSL https://raw.githubusercontent.com/Emirdumn/dopamind/araba-iq/deploy/bootstrap-vps.sh | bash
#
#  VEYA (repo zaten clone'luysa):
#    cd /opt/arabaiq && bash deploy/bootstrap-vps.sh
#
#  Flags (env vars):
#    NONINTERACTIVE=1   — soru sormadan varsayılanlarla devam et
#    SKIP_SEED=1        — seed_demo.py çalıştırma
#    SKIP_NGINX=1       — nginx config'e dokunma
#    REPO_URL=...       — farklı bir git remote (default: dopamind)
#    BRANCH=...         — farklı bir branch (default: araba-iq)
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Defaults ──────────────────────────────────────────────────────────────
PROJECT_DIR="${PROJECT_DIR:-/opt/arabaiq}"
REPO_URL="${REPO_URL:-https://github.com/Emirdumn/dopamind.git}"
BRANCH="${BRANCH:-araba-iq}"
NONINTERACTIVE="${NONINTERACTIVE:-0}"
SKIP_SEED="${SKIP_SEED:-0}"
SKIP_NGINX="${SKIP_NGINX:-0}"

# ── Pretty print helpers ──────────────────────────────────────────────────
c_bold=$'\033[1m'; c_green=$'\033[32m'; c_yellow=$'\033[33m'
c_red=$'\033[31m'; c_blue=$'\033[34m'; c_reset=$'\033[0m'

step()  { echo; echo "${c_bold}${c_blue}▶ $*${c_reset}"; }
ok()    { echo "${c_green}  ✓${c_reset} $*"; }
warn()  { echo "${c_yellow}  ⚠${c_reset} $*"; }
fail()  { echo "${c_red}  ✗${c_reset} $*" >&2; exit 1; }
ask()   {
  local prompt="$1" default="${2:-}" var
  if [[ "$NONINTERACTIVE" == "1" ]]; then echo "$default"; return; fi
  if [[ -n "$default" ]]; then
    read -r -p "  $prompt [$default]: " var
    echo "${var:-$default}"
  else
    read -r -p "  $prompt: " var
    echo "$var"
  fi
}

# ── Must be root ──────────────────────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
  fail "Bu script root olarak çalıştırılmalı (sudo bash $0)"
fi

echo "${c_bold}"
cat <<'BANNER'
  ╔═══════════════════════════════════════════════════╗
  ║   ArabaIQ — VPS bootstrap                         ║
  ║   github.com/Emirdumn/dopamind @ araba-iq         ║
  ╚═══════════════════════════════════════════════════╝
BANNER
echo "${c_reset}"

# ── 1. Docker ──────────────────────────────────────────────────────────────
step "1/7  Docker kurulumu"
if command -v docker >/dev/null 2>&1; then
  ok "docker zaten kurulu ($(docker --version))"
else
  curl -fsSL https://get.docker.com | sh
  ok "docker kuruldu"
fi

if docker compose version >/dev/null 2>&1; then
  ok "compose plugin var ($(docker compose version --short 2>/dev/null || echo ok))"
else
  fail "docker compose plugin eksik — get.docker.com script'i yetersiz geldi"
fi

systemctl enable --now docker >/dev/null 2>&1 || true

# ── 2. Repo ────────────────────────────────────────────────────────────────
step "2/7  Repo: $REPO_URL @ $BRANCH → $PROJECT_DIR"
if [[ -d "$PROJECT_DIR/.git" ]]; then
  ok "repo zaten var, pull ediliyor"
  cd "$PROJECT_DIR"
  git fetch --all --prune
  git checkout "$BRANCH"
  git reset --hard "origin/$BRANCH"
else
  mkdir -p "$PROJECT_DIR"
  cd "$PROJECT_DIR"
  git clone "$REPO_URL" .
  git checkout "$BRANCH"
  ok "repo clone'landı"
fi

cd "$PROJECT_DIR"

# ── 3. .env.production ────────────────────────────────────────────────────
step "3/7  .env.production"
if [[ -f .env.production ]]; then
  ok ".env.production zaten var, dokunulmadı"
else
  if [[ ! -f .env.production.example ]]; then
    fail ".env.production.example bulunamadı — repo eksik clone'lanmış"
  fi
  cp .env.production.example .env.production

  GENERATED_DB_PW="$(openssl rand -base64 32 | tr -d '=+/' | cut -c1-32)"
  OTOAPI_KEY_VAL="$(ask 'OtoApi dashboard anahtarın (boşsa sonra düzenlersin)' '')"

  # sed inline replace — BSD/GNU uyumlu olsun diye Python yerine awk + mv kullan
  tmp="$(mktemp)"
  awk -v pw="$GENERATED_DB_PW" -v ok="$OTOAPI_KEY_VAL" '
    /^ARABA_IQ_DB_PASSWORD=/ { print "ARABA_IQ_DB_PASSWORD=" pw; next }
    /^OTOAPI_KEY=/           { print "OTOAPI_KEY=" ok; next }
    { print }
  ' .env.production > "$tmp"
  mv "$tmp" .env.production
  chmod 600 .env.production

  ok ".env.production yazıldı (DB pw: auto-generated, 32 char)"
  warn "   → içine bak, gerekli diğer alanları doldur: nano $PROJECT_DIR/.env.production"
fi

# ── 4. Stack up ───────────────────────────────────────────────────────────
step "4/7  docker compose build + up"
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

ok "container'lar ayağa kalktı — health-check bekleniyor…"

# API'nin /health'ine 60 sn boyunca poll yap
for i in $(seq 1 30); do
  if curl -fsS --max-time 2 http://127.0.0.1:8101/health >/dev/null 2>&1; then
    ok "api /health OK"
    break
  fi
  sleep 2
  if [[ $i -eq 30 ]]; then
    warn "api /health 60 sn içinde yanıt vermedi — logları kontrol et:"
    echo "      docker compose -f docker-compose.prod.yml logs api"
  fi
done

for i in $(seq 1 30); do
  if curl -fsS --max-time 2 http://127.0.0.1:3001/tr >/dev/null 2>&1; then
    ok "frontend /tr OK"
    break
  fi
  sleep 2
  if [[ $i -eq 30 ]]; then
    warn "frontend /tr 60 sn içinde yanıt vermedi"
    echo "      docker compose -f docker-compose.prod.yml logs frontend"
  fi
done

# ── 5. Seed ───────────────────────────────────────────────────────────────
step "5/7  Demo seed"
if [[ "$SKIP_SEED" == "1" ]]; then
  warn "SKIP_SEED=1 — atlandı"
else
  if docker compose -f docker-compose.prod.yml exec -T api python scripts/seed_demo.py; then
    ok "demo seed tamam"
  else
    warn "seed başarısız — sonra elle: docker compose -f docker-compose.prod.yml exec api python scripts/seed_demo.py"
  fi
fi

# ── 6. nginx ──────────────────────────────────────────────────────────────
step "6/7  nginx site config"
if [[ "$SKIP_NGINX" == "1" ]]; then
  warn "SKIP_NGINX=1 — atlandı"
elif ! command -v nginx >/dev/null 2>&1; then
  warn "nginx bulunamadı — VPS'te nginx yok mu? Elle kur sonra bu bloğu tekrarla."
else
  if [[ ! -f /etc/nginx/sites-available/arabaiq ]]; then
    cp deploy/nginx-arabaiq.conf.example /etc/nginx/sites-available/arabaiq
    ln -sf /etc/nginx/sites-available/arabaiq /etc/nginx/sites-enabled/arabaiq
    ok "site config /etc/nginx/sites-available/arabaiq kuruldu"
  else
    ok "site config zaten var, dokunulmadı"
  fi

  # Cloudflare real-IP snippet
  mkdir -p /etc/nginx/snippets
  {
    curl -fsS https://www.cloudflare.com/ips-v4 | awk '{print "set_real_ip_from " $0 ";"}'
    curl -fsS https://www.cloudflare.com/ips-v6 | awk '{print "set_real_ip_from " $0 ";"}'
  } > /etc/nginx/snippets/cloudflare-ips.conf
  ok "cloudflare IP listesi yenilendi"

  if nginx -t 2>&1 | tail -5; then
    systemctl reload nginx
    ok "nginx reload edildi"
  else
    warn "nginx -t HATA verdi → elle düzeltmen lazım"
  fi
fi

# ── 7. GitHub Actions deploy key ─────────────────────────────────────────
step "7/7  GitHub Actions için deploy SSH key"
KEY_PATH="$HOME/.ssh/arabaiq_deploy"
if [[ -f "$KEY_PATH" ]]; then
  ok "deploy key zaten var: $KEY_PATH"
else
  mkdir -p "$HOME/.ssh"
  chmod 700 "$HOME/.ssh"
  ssh-keygen -t ed25519 -f "$KEY_PATH" -C "github-deploy-arabaiq" -N "" >/dev/null
  cat "$KEY_PATH.pub" >> "$HOME/.ssh/authorized_keys"
  chmod 600 "$HOME/.ssh/authorized_keys"
  ok "yeni deploy key üretildi ve authorized_keys'e eklendi"
fi

echo
echo "${c_bold}${c_green}═══════════════════════════════════════════════════════════${c_reset}"
echo "${c_bold}  KURULUM BİTTİ — GitHub Secret'larına kopyalayacağın 4 değer${c_reset}"
echo "${c_bold}${c_green}═══════════════════════════════════════════════════════════${c_reset}"

VPS_IP="$(curl -fsS --max-time 3 https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')"

cat <<EOF

  ${c_bold}VPS_HOST${c_reset}         = $VPS_IP
  ${c_bold}VPS_USER${c_reset}         = root
  ${c_bold}VPS_PROJECT_PATH${c_reset} = $PROJECT_DIR
  ${c_bold}VPS_SSH_KEY${c_reset}      = (aşağıdaki satırın tamamı, -----BEGIN dahil -----END dahil)

─────────── VPS_SSH_KEY başlangıç ───────────
$(cat "$KEY_PATH")
─────────── VPS_SSH_KEY bitiş ───────────────

EOF

echo "${c_bold}Sonraki adımlar:${c_reset}"
cat <<EOF
  1. Cloudflare DNS → A record'u $VPS_IP'ye işaretle (proxy turuncu)
  2. Cloudflare SSL → Flexible (veya local'den ./deploy/setup-cloudflare.sh çalıştır)
  3. GitHub Secrets:
     - Local makinende: ./deploy/setup-github-secrets.sh
     - VEYA elle: github.com/Emirdumn/dopamind → Settings → Secrets → Actions
  4. Test push:
     git commit --allow-empty -m "ci: smoke test" && git push

EOF

echo "${c_green}${c_bold}✓ done${c_reset}"
