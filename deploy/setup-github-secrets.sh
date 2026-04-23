#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#  ArabaIQ — GitHub Secrets setup
#
#  Bu script LOCAL makinede (macOS/Linux) çalıştırılır. `gh` CLI üzerinden
#  repo'nun 4 Actions secret'ını tek seferde ekler/günceller:
#    VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_PROJECT_PATH
#
#  Ön koşul:
#    - gh CLI kurulu ve auth'lu:  gh auth status
#    - VPS'te bootstrap-vps.sh çalıştırılmış, özel anahtar elinde
#
#  Kullanım:
#    ./deploy/setup-github-secrets.sh
#      → etkileşimli: her değeri prompt eder, SSH key için editör açar
#
#    VPS_HOST=1.2.3.4 VPS_SSH_KEY_FILE=~/.ssh/arabaiq_deploy \
#      ./deploy/setup-github-secrets.sh
#      → tek hamlede, editör açmadan
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

REPO="${GH_REPO:-Emirdumn/dopamind}"

c_bold=$'\033[1m'; c_green=$'\033[32m'; c_yellow=$'\033[33m'
c_red=$'\033[31m'; c_blue=$'\033[34m'; c_reset=$'\033[0m'
step() { echo; echo "${c_bold}${c_blue}▶ $*${c_reset}"; }
ok()   { echo "${c_green}  ✓${c_reset} $*"; }
warn() { echo "${c_yellow}  ⚠${c_reset} $*"; }
fail() { echo "${c_red}  ✗${c_reset} $*" >&2; exit 1; }

# ── Preflight ─────────────────────────────────────────────────────────────
command -v gh >/dev/null 2>&1 || fail "gh CLI kurulu değil (brew install gh)"

if ! gh auth status >/dev/null 2>&1; then
  warn "gh auth yok, başlatılıyor…"
  gh auth login
fi

if ! gh repo view "$REPO" >/dev/null 2>&1; then
  fail "Repo erişilemedi: $REPO (gh auth hesabın bu repo'ya yazabiliyor mu?)"
fi

ok "gh auth + repo erişimi tamam ($REPO)"

# ── Değerleri topla ──────────────────────────────────────────────────────
step "Secret değerleri topluyorum"

VPS_HOST_VAL="${VPS_HOST:-}"
if [[ -z "$VPS_HOST_VAL" ]]; then
  read -r -p "  VPS_HOST (VPS IP veya hostname): " VPS_HOST_VAL
fi
[[ -n "$VPS_HOST_VAL" ]] || fail "VPS_HOST boş olamaz"

VPS_USER_VAL="${VPS_USER:-root}"
if [[ -z "${VPS_USER:-}" ]]; then
  read -r -p "  VPS_USER [root]: " input
  VPS_USER_VAL="${input:-root}"
fi

VPS_PROJECT_PATH_VAL="${VPS_PROJECT_PATH:-/opt/arabaiq}"
if [[ -z "${VPS_PROJECT_PATH:-}" ]]; then
  read -r -p "  VPS_PROJECT_PATH [/opt/arabaiq]: " input
  VPS_PROJECT_PATH_VAL="${input:-/opt/arabaiq}"
fi

# SSH key — ya dosyadan oku, ya editörden yapıştır
VPS_SSH_KEY_VAL=""
if [[ -n "${VPS_SSH_KEY_FILE:-}" ]]; then
  [[ -f "$VPS_SSH_KEY_FILE" ]] || fail "Key dosyası bulunamadı: $VPS_SSH_KEY_FILE"
  VPS_SSH_KEY_VAL="$(cat "$VPS_SSH_KEY_FILE")"
else
  echo
  echo "  VPS_SSH_KEY için 3 seçenek:"
  echo "    1) Dosya yolu ver (ör: ~/.ssh/arabaiq_deploy)"
  echo "    2) 'paste' yaz → editör açılır, yapıştır, kaydet"
  echo "    3) 'skip' yaz  → bu secret'ı atla (manuel ekle)"
  read -r -p "  Seçim: " choice
  case "$choice" in
    paste)
      tmp="$(mktemp)"
      "${EDITOR:-nano}" "$tmp"
      VPS_SSH_KEY_VAL="$(cat "$tmp")"
      rm -f "$tmp"
      ;;
    skip) warn "VPS_SSH_KEY atlandı" ;;
    *)
      # pathtilde expand
      path="${choice/#\~/$HOME}"
      [[ -f "$path" ]] || fail "Dosya yok: $path"
      VPS_SSH_KEY_VAL="$(cat "$path")"
      ;;
  esac
fi

# ── Set secrets ──────────────────────────────────────────────────────────
step "Secret'lar GitHub'a yazılıyor ($REPO)"

gh secret set VPS_HOST         --repo "$REPO" --body "$VPS_HOST_VAL"
ok "VPS_HOST = $VPS_HOST_VAL"

gh secret set VPS_USER         --repo "$REPO" --body "$VPS_USER_VAL"
ok "VPS_USER = $VPS_USER_VAL"

gh secret set VPS_PROJECT_PATH --repo "$REPO" --body "$VPS_PROJECT_PATH_VAL"
ok "VPS_PROJECT_PATH = $VPS_PROJECT_PATH_VAL"

if [[ -n "$VPS_SSH_KEY_VAL" ]]; then
  printf '%s' "$VPS_SSH_KEY_VAL" | gh secret set VPS_SSH_KEY --repo "$REPO" --body -
  ok "VPS_SSH_KEY ($(printf '%s' "$VPS_SSH_KEY_VAL" | wc -c | tr -d ' ') byte)"
fi

# ── Listele ──────────────────────────────────────────────────────────────
step "Mevcut secret'lar"
gh secret list --repo "$REPO"

echo
echo "${c_bold}${c_green}✓ Tamam. Otomatik deploy'u test et:${c_reset}"
cat <<EOF

  git commit --allow-empty -m "ci: deploy smoke test"
  git push
  gh run watch --repo $REPO

EOF
