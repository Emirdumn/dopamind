# ADHD Focus Store

ADHD odakli, cok dilli (TR/EN) bir e-ticaret ve icerik platformu.

## Teknoloji

- **Backend**: Django 4.2 + Django REST Framework
- **Frontend**: Next.js 14 + Tailwind CSS
- **Database**: PostgreSQL + Redis
- **Odeme**: Stripe + Iyzico
- **Dil**: Turkce / Ingilizce

## Hizli Baslangic

### Docker ile (Onerilen)

```bash
cp .env.example .env
# .env dosyasini duzenleyin
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1/
- Admin Panel: http://localhost:8000/admin/

### Manuel Kurulum

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

#### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## API Endpoints

| Endpoint | Aciklama |
|----------|----------|
| `POST /api/v1/auth/register/` | Kullanici kayit |
| `POST /api/v1/auth/login/` | JWT giris |
| `GET /api/v1/products/` | Urun listesi |
| `GET /api/v1/products/:slug/` | Urun detay |
| `GET /api/v1/products/categories/` | Kategoriler |
| `GET/POST /api/v1/orders/cart/` | Sepet islemleri |
| `POST /api/v1/orders/checkout/` | Siparis olustur |
| `POST /api/v1/payments/create/` | Odeme baslat |
| `GET /api/v1/content/articles/` | Makaleler |
| `GET /api/v1/content/videos/` | Videolar |

## Proje Yapisi

```
adhd-focus-store/
  backend/               # Django REST API
    apps/
      accounts/          # Kullanici yonetimi
      products/          # Urun katalogu
      orders/            # Siparis ve sepet
      payments/          # Odeme entegrasyonu
      content/           # Icerik yonetimi
      core/              # Ortak modeller
    config/              # Django ayarlari
  frontend/              # Next.js Web App
    src/
      app/[locale]/      # Sayfa routing (TR/EN)
      components/        # UI bilesenler
      stores/            # Zustand state
      i18n/              # Ceviri dosyalari
      lib/               # API client, utils
  docker-compose.yml     # Docker yapilandirmasi
```
