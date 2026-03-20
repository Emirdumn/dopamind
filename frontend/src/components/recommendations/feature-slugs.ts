/**
 * Backend `car_feature_matching` ile uyumlu slug sırası.
 * Görünen etiketler: `arabaIq.recommendations.featureLabels` (tr/en); yeni slug → ikisini de güncelle.
 * @see docs/araba-iq-ui-i18n.md
 */

export const FEATURE_SLUGS = [
  "apple_carplay",
  "android_auto",
  "adaptive_cruise_control",
  "lane_keep_assist",
  "blind_spot_warning",
  "sunroof",
  "panoramic_roof",
  "rear_camera",
  "head_up_display",
  "automatic_park_assistant",
] as const;

export type FeatureSlug = (typeof FEATURE_SLUGS)[number];
