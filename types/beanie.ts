// Condition levels
export type ConditionLevel = 'mint_with_tag' | 'mint_no_tag' | 'excellent' | 'good' | 'fair';

// Pellet types
export type PelletType = 'pvc' | 'pe' | 'unknown';

// Types of follow-up questions
export type FollowUpType =
  | 'condition'           // User selects condition
  | 'pellet_type'         // User feels and reports
  | 'tush_tag_photo'      // Second photo of tush tag (country)
  | 'hang_tag_photo'      // Second photo of hang tag close-up
  | 'color_confirmation'  // Second photo for color variant
  | 'original_packaging'; // User confirms if sealed/packaged

// A follow-up question to ask
export interface FollowUpQuestion {
  type: FollowUpType;
  question: string;           // Display text
  reason: string;             // Why we're asking (shown to user)
  options?: string[];         // For selection questions
  photoPrompt?: string;       // For photo questions - what to photograph
  valueImpact: string;        // e.g., "Could increase value by 10x"
}

// Value breakdown explaining what drives high vs low values
export interface ValueBreakdown {
  no_tag: string;              // e.g., "$3-8"
  common_tag: string;          // e.g., "$5-15 (4th/5th gen, most common)"
  early_tag: string;           // e.g., "$50-150 (1st-3rd gen)"
  mint_premium: string;        // e.g., "+20% for mint with tag protector"
  key_factors: string[];       // e.g., ["Tag generation", "Condition", "PVC vs PE pellets"]
}

// Enhanced identification response from Claude
export interface BeanieIdentification {
  name: string;
  animal_type: string;
  variant: string;
  colors: string[];
  estimated_value_low: number;
  estimated_value_high: number;
  value_notes: string;
  confidence: string;
  has_visible_hang_tag: boolean;

  // Value breakdown - explains what drives high vs low values
  value_breakdown?: ValueBreakdown;

  // New fields for Smart Variant Detection
  needs_follow_up: boolean;
  follow_up_questions?: FollowUpQuestion[];
  potential_value_if_rare?: {
    low: number;
    high: number;
    conditions: string;  // What would make it this valuable
  };
}

// User's answers to follow-up questions
export interface FollowUpAnswers {
  condition?: ConditionLevel;
  pellet_type?: PelletType;
  country_of_origin?: string;       // From tush tag photo
  tag_generation?: string;          // From hang tag photo
  has_tag_errors?: boolean;
  color_confirmed?: string;         // Confirmed color variant
  original_packaging?: boolean;
}

// Final valuation after follow-ups
export interface FinalValuation {
  name: string;
  variant: string;
  estimated_value_low: number;
  estimated_value_high: number;
  value_explanation: string;        // What factors affected the value
  condition_applied: ConditionLevel | null;
  high_end_factors: string[];       // What would put it at high end
  low_end_factors: string[];        // What would put it at low end
}

// Existing interfaces kept for compatibility

export interface ValueRange {
  min: number;
  max: number;
}

export interface BeanieValues {
  no_tag: ValueRange;
  '4th_gen_plus': ValueRange;
  '3rd_gen': ValueRange;
  '2nd_gen': ValueRange;
  '1st_gen': ValueRange;
}

export interface BeanieData {
  name: string;
  animal_type: string;
  style_number: string;
  birthday: string;
  introduced: string;
  retired: string | null;
  description: string;
  visual_identifiers: string[];
  values: BeanieValues;
  special_notes: string;
}

export interface BeanieDatabase {
  version: string;
  last_updated: string;
  beanies: BeanieData[];
}

// Collection item - a saved Beanie scan
export interface CollectionItem {
  id: string;                    // Unique identifier
  timestamp: number;             // Date.now() when scanned
  thumbnail: string;             // Compressed base64 image
  name: string;
  animal_type: string;
  variant: string;
  colors: string[];
  estimated_value_low: number;
  estimated_value_high: number;
  adjusted_value_low?: number;   // After condition multipliers
  adjusted_value_high?: number;
  condition?: ConditionLevel;
  pellet_type?: PelletType;
  value_notes: string;
  tier: number;                  // 1-5
}
