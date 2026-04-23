# ArabaIQ — Deploy kılavuzu

Bu dosya, `araba-iq` branch'ine her push'un otomatik olarak `arabaiq.com`'a
yansımasını sağlayan altyapıyı **sıfırdan bir kere** kurmak için gereken
adımları anlatır. Kurulum tamamlandıktan sonra gündelik akış şudur:

```
local değişiklik → git push → GitHub Actions → VPS'te rebuild → canlı
```

---

## ⚡ Hızlı yol (tavsiye) — 3 otomasyon script'i

Elle 7 adım yapmak yerine bu 3 script ile ~5 dk'da kurulum:

```bash
# ── 1. VPS'te (bir kere) ──────────────────────────────────────────────
ssh root@<VPS_IP>
curl -fsSL https://raw.githubusercontent.com/Emirdumn/dopamind/araba-iq/deploy/bootstrap-vps.sh | bash
# → çıktıda sana 4 GitHub Secret değeri verecek, kopyala

# ── 2. Local makinende ────────────────────────────────────────────────
./deploy/setup-github-secrets.sh
# → VPS_HOST / VPS_USER / VPS_SSH_KEY / VPS_PROJECT_PATH otomatik

# ── 3. Cloudflare (opsiyonel, API token ile) ─────────────────────────
export CF_API_TOKEN="..."  # https://dash.cloudflare.com/profile/api-tokens
export VPS_IP="1.2.3.4"
./deploy/setup-cloudflare.sh
# → DNS A + SSL flexible + Always HTTPS otomatik

# ── 4. Doğrula ────────────────────────────────────────────────────────
./deploy/verify.sh
```

Altındaki "Manuel yol" bölümü bu script'lerin ne yaptığını tek tek açıklar —
script'lerde bir şey patlarsa rehber olarak kullan.

---

## 0. Genel mimari

```
 ┌──────────┐      https      ┌──────────────┐     http     ┌─────────────┐
 │  Browser │ ───────────────► │  Cloudflare  │ ───────────► │  VPS nginx  │
 └──────────┘                  │  (Flexible)  │              │     :80     │
                               └──────────────┘              └──────┬──────┘
                                                                    │
                                                  ┌─────────────────┼──────────────┐
                                                  │                 │              │
                                                  ▼                 ▼              │
                                           127.0.0.1:3001   127.0.0.1:8101         │
                                          ┌────────────┐   ┌───────────────┐       │
                                          │ frontend   │   │ api (uvicorn) │       │
                                          │ Next.js    │   │ FastAPI       │       │
                                          └─────┬──────┘   └───────┬───────┘       │
                                                │                  │               │
                                                └──────────┬───────┘               │
                                                           │                       │
                                                           ▼                       │
                                                   ┌───────────────┐               │
                                                   │  Postgres 16  │  (internal)   │
                                                   └───────────────┘               │
                                                                                   │
                                         docker-compose.prod.yml ─────────────────┘
```

---

## Manuel yol

## 1. VPS ön koşulları (bir kere)

> Bu bölümdeki her şey VPS'e root olarak ssh'leyerek yapılır.

### 1.1 Docker + docker compose plugin

```bash
# Debian/Ubuntu için resmi Docker kurulumu
curl -fsSL https://get.docker.com | sh

# Plugin'lerin geldiğinden emin ol (docker compose komutu)
docker compose version
```

### 1.2 Git ve proje klasörü

```bash
mkdir -p /opt/arabaiq
cd /opt/arabaiq
git clone https://github.com/Emirdumn/dopamind.git .
git checkout araba-iq
```

> `araba-iq` repo'su `dopamind.git` içinde bir branch olarak yaşıyor. Asıl
> kaynak o; `araba-iq-origin` remote'u ayrı bir mirror.

### 1.3 Production env dosyası

```bash
cp .env.production.example .env.production
# Güçlü şifre üret ve içine yapıştır:
openssl rand -base64 32
nano .env.production
```

Doldurman gerekenler:
- `ARABA_IQ_DB_PASSWORD` — ilk `docker compose up`'tan ÖNCE sabitle.
- `OTOAPI_KEY` — dashboard'dan al.

### 1.4 Stack'i ilk kez ayağa kaldır

```bash
cd /opt/arabaiq
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Loglar
docker compose -f docker-compose.prod.yml logs -f api
```

Doğrulama (VPS içinden):

```bash
curl -s http://127.0.0.1:3001/tr | head -c 200   # frontend HTML dönmeli
curl -s http://127.0.0.1:8101/health             # {"status":"ok"} dönmeli
```

### 1.5 İlk seed (opsiyonel ama önerilir)

```bash
docker compose -f docker-compose.prod.yml exec api python scripts/seed_demo.py
```

Bu, 9 Avrupa segmentini + demo araçları yükler. Production'da gerçek XML
verisi gelince `scripts/import_autodata_xml.py`'i kullanırsın.

---

## 2. nginx — VPS'teki paylaşımlı kurulum

VPS'te **zaten** başka siteler için nginx çalışıyor. Sadece yeni bir site
config dosyası ekliyoruz, mevcut siteleri etkilemiyoruz.

### 2.1 Site config

```bash
sudo cp /opt/arabaiq/deploy/nginx-arabaiq.conf.example \
        /etc/nginx/sites-available/arabaiq

sudo ln -s /etc/nginx/sites-available/arabaiq \
           /etc/nginx/sites-enabled/arabaiq
```

### 2.2 Cloudflare gerçek IP snippet (tavsiye)

Kullanıcının gerçek IP'sini loglarda görmek için:

```bash
sudo mkdir -p /etc/nginx/snippets
curl -s https://www.cloudflare.com/ips-v4 \
  | awk '{print "set_real_ip_from " $0 ";"}' \
  | sudo tee /etc/nginx/snippets/cloudflare-ips.conf

curl -s https://www.cloudflare.com/ips-v6 \
  | awk '{print "set_real_ip_from " $0 ";"}' \
  | sudo tee -a /etc/nginx/snippets/cloudflare-ips.conf
```

### 2.3 Reload

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Doğrulama (dışarıdan):

```bash
curl -I http://arabaiq.com
# → HTTP/1.1 200 OK (veya 301/308 www → apex)
```

---

## 3. Cloudflare ayarları

1. DNS → `arabaiq.com` ve `www` için A record'lar **VPS IP**'ye işaretli
   olsun. Proxy (turuncu bulut) **açık** olmalı.
2. SSL/TLS → Encryption mode: **Flexible** (browser↔CF HTTPS, CF↔VPS HTTP)
   - Daha güvenli istiyorsan: Cloudflare Origin Certificate oluştur, VPS'e
     yükle, nginx'te `listen 443 ssl`'e geç, SSL mode'u **Full (strict)**
     yap. Bu sonraki iş.
3. Rules → "Always Use HTTPS" aç (browser↔CF yönünü zorla)

---

## 4. GitHub Actions — otomatik deploy

### 4.1 VPS'te deploy key oluştur

```bash
ssh-keygen -t ed25519 -f ~/.ssh/arabaiq_deploy -C "github-deploy-arabaiq" -N ""
cat ~/.ssh/arabaiq_deploy.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/arabaiq_deploy
```

Son komutun çıktısı **PRIVATE key**'dir — GitHub Secret'a koyacağız.

### 4.2 GitHub → Settings → Secrets and variables → Actions

Aşağıdaki 4 secret'ı oluştur:

| Secret adı         | Değer                                                                    |
| ------------------ | ------------------------------------------------------------------------ |
| `VPS_HOST`         | VPS'in IP adresi veya hostname (ör: `203.0.113.42`)                      |
| `VPS_USER`         | `root`                                                                   |
| `VPS_SSH_KEY`      | Yukarıda `cat ~/.ssh/arabaiq_deploy` çıktısının **tamamı** (private key) |
| `VPS_PROJECT_PATH` | `/opt/arabaiq`                                                           |

### 4.3 Test et

```bash
# Local'de
git commit --allow-empty -m "ci: deploy smoke test"
git push
```

GitHub → Actions sekmesinde `Deploy araba-iq to VPS` workflow'u çalışmalı.
Yeşil onay geldikten sonra `curl -I http://arabaiq.com` ile yeni deploy'u
doğrula.

Manuel tetiklemek gerekirse: GitHub → Actions → bu workflow → `Run workflow`.

---

## 5. Gündelik akış (kurulum bittikten sonra)

```bash
# Local'de değişiklik yap
git add -A
git commit -m "feat: bla bla"
git push
```

→ GitHub Actions otomatik çalışır → VPS'te yeni commit çekilir → Docker
image'leri rebuild olur → container'lar rolling restart → canlıda.

Süre: ilk sefer ~3 dk (cache yok), sonraki deploy'lar ~45 sn - 2 dk.

---

## 6. Sorun giderme

### Frontend açılmıyor
```bash
docker compose -f docker-compose.prod.yml logs --tail=200 frontend
```

### API 502 dönüyor
```bash
docker compose -f docker-compose.prod.yml logs --tail=200 api
docker compose -f docker-compose.prod.yml exec api alembic current
```

### DB şifresi unutuldu / değişmesi gerekiyor
```bash
docker compose -f docker-compose.prod.yml down
docker volume rm araba_iq_db_prod   # ⚠ tüm veri gider
# .env.production'da yeni şifreyi ayarla
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml exec api python scripts/seed_demo.py
```

### nginx config hatalı geldi
```bash
sudo nginx -t   # sözdizim hatasını gösterir
```

### Rollback
```bash
cd /opt/arabaiq
git log --oneline -10                    # hangi commit'e döneyim?
git reset --hard <eski-commit-hash>
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

---

## 7. Daha sonra yapılacak iyileştirmeler (backlog)

- Cloudflare Origin Cert → `Full (strict)` SSL moduna geç
- Health-check endpoint'ine GitHub Actions'tan `curl` smoke-test ekle
- Prod DB backup cron (docker exec pg_dump → S3/R2)
- Sentry / uptime monitoring
- Rate limiting — nginx `limit_req_zone` ile `/api/` altında
