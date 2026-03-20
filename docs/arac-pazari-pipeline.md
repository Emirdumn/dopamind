# Araç kıyaslama / piyasa özeti — pipeline ve MVP sırası

**Ürün adı: ArabaIQ.** Segment ve filtre motoru: **Segmento.** Uygulama kodu: [`araba-iq-api/`](../araba-iq-api/README.md).

> Not: E-ticaret tarafı **Django + DRF**; ArabaIQ API ayrı servis olarak **FastAPI + PostgreSQL** (`docker-compose`: `araba-iq-db`, port 5433).

## İsim önerisi (kısa)

| Aday        | Güçlü yön                          | Zayıf yön / dikkat        |
|------------|-------------------------------------|----------------------------|
| **ArabaIQ**| TR’de anında anlaşılır, “akıllı seçim” | Global marka biraz yerel   |
| **OtoSkor**| Skor + kıyas doğrudan                | Daha “araç” değil “skor” hissi |
| **Carlytics** | Veri / analitik, startup dili     | TR’de telaffuz / açıklama gerekebilir |

**Öneri:** Birincil marka **ArabaIQ**; uluslararası / ikinci marka veya alt ürün adı olarak **Carlytics**.

---

## 1) Uçtan uca veri ve ürün pipeline’ı (MVP)

Aşağıdaki akış “önce ne oturur, sonra ne beslenir” sırasını gösterir.

```mermaid
flowchart TB
  subgraph ingest [1 - Veri katmanı]
    L[(market_listings)]
    V[(car_variants)]
    M[(models / brands / segments)]
  end

  subgraph compute [2 - Hesap katmanı - job veya tetik]
    S[stats.py: mean median std var percentile z-score]
    C[corr price vs mileage]
    O[outlier / örneklem yeterliliği]
    MS[(market_stats önbellek tablosu)]
  end

  subgraph api [3 - REST API]
    GC[GET /cars filtreler]
    CP[POST /cars/compare]
    GS[GET /market/stats/id]
    GP[GET /market/position/listing_id]
    PF[POST /fit-score]
  end

  subgraph explain [4 - Açıklama katmanı]
    E[explanation_service: kısa Türkçe yorum]
  end

  subgraph user [Kullanıcı]
    U[Segment → filtre → liste → kıyas → skor]
  end

  M --> V
  V --> L
  L --> S
  S --> C
  S --> O
  S --> MS
  MS --> GS
  L --> GP
  V --> GC
  V --> CP
  MS --> CP
  V --> PF
  GS --> E
  GP --> E
  PF --> E
  GC --> U
  CP --> U
  GS --> U
  PF --> U
```

**Özet:** İlanlar `market_listings`’e girer → periyodik job `market_stats`’ı doldurur → API hem sayı hem `explanation_service` ile metin döner → kıyas ve fit-score bu tablolardan beslenir.

---

## 2) MVP geliştirme sırası (senin 7 günlük planın — tek şema)

```mermaid
flowchart LR
  A[Şema: brands segments models variants] --> B[GET /cars ve detay]
  B --> C[market_listings + mock]
  C --> D[job: market_stats]
  D --> E[GET /market/stats]
  E --> F[POST /cars/compare + piyasa özeti]
  F --> G[user_preferences]
  G --> H[rule-based fit-score + açıklama]
```

---

## 3) Faz 3+ (şimdilik dışarıda — pipeline’a sonradan eklenir)

```mermaid
flowchart LR
  F1[Forum / metin kaynakları] --> NLP[NLP / sınıflandırma]
  NLP --> R[kronik sorun / uyumluluk sinyali]
  R --> API2[Mevcut fit-score veya ayrı endpoint]
```

---

## 4) API yanıt ilkesi

Her istatistik cevabında: **ham metrik + `price_comment` (veya eşdeğeri)** birlikte; pozisyon için **z-score + ucuz/normal/pahalı + yüzde farkı**.

---

## 5) İlk yapılacaklar (bugün checklist)

1. Ürün adını kilitle (öneri: **ArabaIQ**).
2. Tablolar: `brands`, `segments`, `models`, `car_variants`, `market_listings` (+ isteğe bağlı `market_stats` ilk günden tasarla, doldurmayı 4. güne bırakabilirsin).
3. Endpointler: `GET /cars`, `GET /cars/{id}`, `POST /cars/compare`, `GET /market/stats/{car_variant_id}`.
4. 10–15 mock ilan; `stats` + kısa Türkçe yorum.
5. Sonra: tercihler + `POST /fit-score` + `POST /recommendations`.
