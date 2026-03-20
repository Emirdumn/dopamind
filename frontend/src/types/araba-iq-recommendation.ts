/** Form state (UI); submit sırasında API body’ye map edilir */

export interface RecommendationFormState {
  budget_max: number;
  fuel_preference: string;
  city_usage_ratio: number;
  performance_priority: number;
  economy_priority: number;
  comfort_priority: number;
  family_priority: number;
  prestige_priority: number;
  resale_priority: number;
  maintenance_sensitivity: number;
  required_features: string[];
  preferred_features: string[];
  segment_ids: number[];
  strict_required: boolean;
  include_debug: boolean;
  limit: number;
}

export const defaultRecommendationFormState = (): RecommendationFormState => ({
  budget_max: 2_000_000,
  fuel_preference: "",
  city_usage_ratio: 60,
  performance_priority: 5,
  economy_priority: 5,
  comfort_priority: 5,
  family_priority: 5,
  prestige_priority: 5,
  resale_priority: 5,
  maintenance_sensitivity: 5,
  required_features: [],
  preferred_features: [],
  segment_ids: [],
  strict_required: false,
  include_debug: false,
  limit: 10,
});

export function formStateToRequestBody(s: RecommendationFormState): RecommendationRequestBody {
  const fuel = s.fuel_preference.trim();
  return {
    budget_max: s.budget_max,
    fuel_preference: fuel === "" ? null : fuel,
    city_usage_ratio: s.city_usage_ratio,
    performance_priority: s.performance_priority,
    economy_priority: s.economy_priority,
    comfort_priority: s.comfort_priority,
    family_priority: s.family_priority,
    prestige_priority: s.prestige_priority,
    resale_priority: s.resale_priority,
    maintenance_sensitivity: s.maintenance_sensitivity,
    required_features: [...s.required_features],
    preferred_features: [...s.preferred_features],
    segment_ids: [...s.segment_ids],
    strict_required: s.strict_required,
    include_debug: s.include_debug,
    limit: s.limit,
  };
}

/** POST /recommendations — backend ile hizalı */

export interface RecommendationRequestBody {
  budget_max: number;
  fuel_preference: string | null;
  city_usage_ratio: number;
  performance_priority: number;
  economy_priority: number;
  comfort_priority: number;
  family_priority: number;
  prestige_priority: number;
  resale_priority: number;
  maintenance_sensitivity: number;
  required_features: string[];
  preferred_features: string[];
  segment_ids: number[];
  strict_required: boolean;
  include_debug: boolean;
  limit: number;
}

export interface PriceSummary {
  avg_price: number | null;
  sample_size: number;
  price_comment: string;
}

export interface RecommendationItem {
  car_id: number;
  car_name: string;
  overall_score: number;
  fit_score: number;
  feature_match_score: number;
  market_score: number;
  matched_required_features: string[];
  matched_preferred_features: string[];
  matched_required_count: number;
  matched_preferred_count: number;
  missing_required_features: string[];
  ranking_reason: string;
  candidate_filter_reason: string | null;
  price_summary: PriceSummary;
  reasons: string[];
  cautions: string[];
}

export interface ExcludedCandidate {
  car_id: number;
  car_name: string;
  reason: string;
}

export interface RecommendationResponse {
  total_candidates: number;
  returned_count: number;
  results: RecommendationItem[];
  excluded_candidates: ExcludedCandidate[] | null;
}

export interface SegmentItem {
  id: number;
  name: string;
  category_type?: string;
  description?: string | null;
}
