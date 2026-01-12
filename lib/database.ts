import { BeanieData, BeanieDatabase } from '../types/beanie';
import beanieDatabase from '../data/beanies.json';

const db = beanieDatabase as BeanieDatabase;

/**
 * Normalize a string for fuzzy matching
 */
function normalize(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

/**
 * Calculate simple similarity score between two strings
 */
function similarity(a: string, b: string): number {
  const aNorm = normalize(a);
  const bNorm = normalize(b);

  if (aNorm === bNorm) return 1;
  if (aNorm.includes(bNorm) || bNorm.includes(aNorm)) return 0.8;

  // Simple character overlap score
  const aChars = new Set(aNorm.split(''));
  const bChars = new Set(bNorm.split(''));
  const intersection = [...aChars].filter((c) => bChars.has(c)).length;
  const union = new Set([...aChars, ...bChars]).size;

  return intersection / union;
}

/**
 * Look up a Beanie Baby by name with fuzzy matching
 * Returns the best match or null if no reasonable match found
 */
export function lookupBeanie(name: string): BeanieData | null {
  if (!name || name.toLowerCase() === 'not a beanie baby') {
    return null;
  }

  const normalizedInput = normalize(name);

  // First try exact match
  const exactMatch = db.beanies.find(
    (b) => normalize(b.name) === normalizedInput
  );
  if (exactMatch) return exactMatch;

  // Try fuzzy match
  let bestMatch: BeanieData | null = null;
  let bestScore = 0;

  for (const beanie of db.beanies) {
    const score = similarity(name, beanie.name);
    if (score > bestScore && score >= 0.6) {
      bestScore = score;
      bestMatch = beanie;
    }
  }

  return bestMatch;
}

/**
 * Get the estimated value for a Beanie Baby
 * Defaults to 4th_gen_plus pricing since that's most common
 */
export function getEstimatedValue(
  beanie: BeanieData,
  tagGeneration: '1st_gen' | '2nd_gen' | '3rd_gen' | '4th_gen_plus' | 'no_tag' = '4th_gen_plus'
): { min: number; max: number } {
  return beanie.values[tagGeneration];
}

/**
 * Get all Beanie Babies in the database
 */
export function getAllBeanies(): BeanieData[] {
  return db.beanies;
}

/**
 * Get database metadata
 */
export function getDatabaseInfo(): { version: string; lastUpdated: string; count: number } {
  return {
    version: db.version,
    lastUpdated: db.last_updated,
    count: db.beanies.length,
  };
}
