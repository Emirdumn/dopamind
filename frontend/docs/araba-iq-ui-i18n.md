# ArabaIQ öneriler + karşılaştırma: UI metinleri ve i18n

## Feature slug’ları

Yeni bir donanım slug’ı eklerken **iki yeri** güncelle:

1. `src/components/recommendations/feature-slugs.ts` — `FEATURE_SLUGS` listesi (API ile aynı sıra/anahtar).
2. `src/i18n/messages/tr.json` ve `en.json` — `arabaIq.recommendations.featureLabels` içinde aynı anahtar.

## API değeri vs ekranda görünen metin

- **Yakıt:** Form/API `fuel_preference` değerleri sabit (`""`, `Hybrid`, `Benzin`, `Dizel`). Select’te görünen metin `fuelAny`, `fuelHybrid`, `fuelGasoline`, `fuelDiesel` ile çevrilir.
- **Preset diff:** `summarizePresetDiff` yakıt ve donanım dizilerini kullanıcı dilinde göstermek için aynı i18n anahtarlarını kullanır.

## Backend metinleri (çeviri yok)

Şu an **bilinçli olarak** çevrilmiyor; API’den geldiği gibi gösteriliyor:

- Özet / öneri metinleri (`ranking_reason`, `reasons`, `summary_comments`, vb.)
- Segment adları (API)

Bunları çevirmek istersen ayrı bir katman (locale-aware API veya çeviri servisi) gerekir; frontend’de zorla eşleştirmek şu an kapsam dışı.

## Preset metinleri

Hazır senaryo **başlık / açıklama** ve form alanı **diff etiketleri**: `arabaIq.recommendations` altında `presetCards`, `presetFieldLabels`, `presetValueEmpty` / `On` / `Off`. Kod tarafında sadece `patch` tanımı: `src/lib/recommendation-presets.ts`.

## Locale fallback

`getArabaIqMessages`: `tr` → `tr.json`, diğer tüm diller → `en.json` (`arabaIq` kökü).

---

## Current limitations

- **Backend üretimli metinler** (`ranking_reason`, `reasons`, `summary_comments`, fiyat yorumları vb.) locale’e göre çevrilmiyor; API ne dönerse o gösterilir.
- **Preset diff’te segmentler** yalnızca `segment_ids` sayıları olarak listelenir; isim çözümü API’den gelmedikçe frontend’de yapılmaz.
- **`arabaIq` çevirileri** yalnızca `tr` ve `en` JSON’da; diğer site locale’leri (`es` vb.) için `arabaIq` metinleri **İngilizce** fallback ile gelir (`getArabaIqMessages`).
- **Karşılaştırma** tamamen mevcut API yanıtına bağlı; backend alanları değişirse pivot tablolar etkilenir (ayrı sözleşme/dokümantasyon API README’de).

---

## Smoke test checklist (recommendations + compare)

Ön koşul: ArabaIQ API erişilebilir, `frontend` `.env.local` içinde doğru `NEXT_PUBLIC_*` / proxy ayarı.

### Öneriler (`/[locale]/recommendations`)

- [ ] `tr` ve `en` sayfaları hatasız açılıyor.
- [ ] Segment listesi yükleniyor veya boşta zarif davranıyor; form gönderimi çalışıyor.
- [ ] Sonuç kartları geldiğinde skor / ranking alanı görünüyor; **Karşılaştırmaya ekle** ile tray güncelleniyor.
- [ ] 2 araç seçiliyken tray’de **Karşılaştırmayı aç** belirgin; linke tıklanınca compare sayfasına gidiliyor.
- [ ] `total_candidates === 0` iken boş metin + **hızlı deneme** chip’leri formu güncelliyor (bütçe / strict / donanım / segment).
- [ ] Bir preset uygula: banner başlığı ve “güncellenen alanlar” listesi anlamlı (i18n metinleri).

### Karşılaştırma (`/[locale]/compare`)

- [ ] En az 2 araç seçiliyken veya URL `?ids=a,b` ile yükleme sonrası tablolar geliyor.
- [ ] Sekmeler: Özet, Teknik, Performans, Piyasa, Donanım arası geçiş çalışıyor.
- [ ] Teknik / Performans / Piyasa / Donanım üstünde **Kim önde?** kutusu görünüyor (veri uygunsa).
- [ ] Donanım: üst özet satırı, **Sadece farkları göster** ve kategori filtresi beklenen satırları gösteriyor.
- [ ] Dar ekranda tablolar yatay kaydırılabiliyor (taşma kontrollü).

### Genel

- [ ] `cd frontend && npm run build` hatasız tamamlanıyor.
