import tr from "@/i18n/messages/tr.json";
import en from "@/i18n/messages/en.json";

/** Öneriler/compare UI metin kökü. Özet notlar: `docs/araba-iq-ui-i18n.md` */

export type ArabaIqErrorMessages = (typeof en.arabaIq)["errors"];
export type ArabaIqRecommendationMessages = (typeof en.arabaIq)["recommendations"];
export type ArabaIqCompareMessages = (typeof en.arabaIq)["compare"];
export type ArabaIqMessages = typeof en.arabaIq;

export function getArabaIqMessages(locale: string): ArabaIqMessages {
  return locale === "tr" ? tr.arabaIq : en.arabaIq;
}
