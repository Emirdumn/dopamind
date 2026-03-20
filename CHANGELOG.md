# Changelog

Bu dosya kullanıcıya dönük önemli değişiklikleri ve kapanan iş paketlerini kısa notlarla tutar.

## 2026-03-20 — ArabaIQ recommendation + compare UI *(iş paketi kapatıldı)*

**Kapsam:** Frontend’de araç önerileri ve karşılaştırma akışının i18n birliği, preset metinlerinin `arabaIq.recommendations` altına taşınması, compare/recommendation UX cilası, geliştirici dokümantasyonu.

**Öne çıkanlar:**

- Preset: yalnızca `id` + `patch` kodda; başlık/açıklama ve diff alan etiketleri `tr.json` / `en.json`.
- Donanım: `FEATURE_SLUGS` + `featureLabels` eşlemesi; yakıt API değeri vs görünen etiket ayrımı.
- Compare: donanım filtresi/özet, sekme “kim önde?” kutuları; önerilerde compare tray ve boş sonuç chip’leri.
- Sınırlar + smoke checklist: [`frontend/docs/araba-iq-ui-i18n.md`](frontend/docs/araba-iq-ui-i18n.md).

**Durum:** Bu iş paketi **merge için hazır** kabul edilir; yeni özellikler ayrı PR’larda açılmalıdır.

---

## Önceki sürümler

Önceki değişiklikler için git geçmişine bakın; bu CHANGELOG 2026-03-20 itibarıyla oluşturuldu.
