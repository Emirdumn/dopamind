# ArabaIQ — eksik pipeline roadmap (ürün → yatırım)

**Pozisyon:** ArabaIQ ilan sitesi değil; **karar motoru** — “Bu ilan mantıklı mı?” sorusunun cevabı core value.

**İlkeler:** Kullanıcı ham std istemez; **yorum + bağlam** ister. Veri kalitesi ve örneklem büyüklüğü her şeyi belirler.

---

## Faz 1 — Gerçek piyasa verisi + anlamlı analiz

| # | İş | Amaç |
|---|-----|------|
| 1.1 | `GET /market/listings` | Seçilen varyantın **gerçek ilanlarını** listele (fiyat, km, şehir, satıcı, link). |
| 1.2 | `GET /market/position/{listing_id}` | **Ucuz / normal / pahalı**, z-score, Türkçe açıklama — “game changer”. |
| 1.3 | `stats_refresh_job` | Aktif ilanlardan `market_stats`’ı periyodik yenile (mean, median, std, varyans, km–fiyat korelasyonu). |

**Hafta 1 bittiğinde:** Ürün gerçek (veya içe aktarılmış) ilan verisiyle uçtan uca çalışır.

---

## Faz 2 — Ürünü akıllı hale getirme

- `car_features` + `GET /cars/{id}/features`; compare’da donanım.
- Compare’da **kazanan/kaybeden** kısa yorumları.
- `POST /recommendations` — fit + donanım eşleşmesi + piyasa alt skoru + gerekçe (rule-based).
- Fit-score: normalize, kullanıcı ağırlıkları, daha gerçekçi kurallar.

---

## Faz 3 — AI + fark

- Forum/yorum pipeline → sorun çıkarımı, sentiment, özet.
- **Risk skoru** (şanzıman, bakım, kronik algı).
- Fiyat **trend** (zaman serisi).
- **Alert** (fiyat düştü, ortalamanın altına indi).

---

## Haftalık execution özeti

| Hafta | Odak |
|-------|------|
| 1 | listings, position, stats job |
| 2 | car_features, compare++, fit-score++ |
| 3 | recommendations, temel UI cilası |
| 4+ | NLP, risk, trend, alert |

---

## Kod durumu (işaret)

- [x] **Faz 1.1** `GET /api/v1/market/listings` — `app/api/routes/market.py` + `market_service.list_listings`
- [x] **Faz 1.2** `GET /api/v1/market/position/{listing_id}` — `market_position_service` (`market_stats` avg/std + z-score)
- [x] **Faz 1.3** `scripts/stats_refresh_job.py` → `refresh_all_market_stats` (mean, median, std, varyans, km–fiyat korelasyonu)
- [x] **Faz 2.1** `car_features` tablosu + `GET /api/v1/cars/{id}/features` + `POST /cars/compare` içinde `equipment_comparison` (`comparison_service` + seed’de donanım)
- [x] **Faz 2.2** Compare’da kısa **kazanan/kaybeden** tarzı özetler — `summary_comments` (`compare_narrative.py`: yakıt, bagaj, piyasa, prestij, donanım sayısı, tekilleşen özellikler)
- [ ] **Faz 2** fit-score++ (normalize, kullanıcı ağırlıkları)
- [x] **Faz 2** `POST /api/v1/recommendations` — `recommendation_service` (fit + donanım eşleşmesi + piyasa alt skoru + `reasons` / `cautions` + `price_summary`)
- [ ] **Faz 3** — NLP, risk, trend, alert (plan)

Cron örneği: `0 */6 * * * cd araba-iq-api && .venv/bin/python scripts/stats_refresh_job.py`
