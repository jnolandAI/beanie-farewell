export interface BeanieIdentification {
  name: string;
  animal_type: string;
  variant: string;
  colors: string[];
  estimated_value_low: number;
  estimated_value_high: number;
  value_notes: string;
  confidence: 'High' | 'Medium' | 'Low';
  has_visible_hang_tag: boolean;
}

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
