import beaniesData from '../data/beanies.json';

export interface SearchResult {
  name: string;
  animal_type: string;
  description: string;
  score: number;
}

interface BeanieEntry {
  name: string;
  animal_type: string;
  description: string;
  visual_identifiers?: string[];
  special_notes?: string;
}

const beanies: BeanieEntry[] = beaniesData.beanies;

// Animal type emoji mapping for display
export const ANIMAL_EMOJIS: Record<string, string> = {
  Bear: '🐻',
  Frog: '🐸',
  Pig: '🐷',
  Dog: '🐕',
  Dolphin: '🐬',
  Whale: '🐋',
  Moose: '🦌',
  Platypus: '🦆',
  Lobster: '🦞',
  Unicorn: '🦄',
  Tiger: '🐯',
  Inchworm: '🐛',
  Ladybug: '🐞',
  Elephant: '🐘',
  Cat: '🐱',
  Monkey: '🐵',
  Horse: '🐴',
  Giraffe: '🦒',
  Turkey: '🦃',
  Duck: '🦆',
  Raccoon: '🦝',
  Skunk: '🦨',
  Fox: '🦊',
  Squirrel: '🐿️',
  Owl: '🦉',
  Toucan: '🐦',
  Pelican: '🐦',
};

/**
 * Search the Beanie Baby database with relevance scoring.
 * Matches against name, animal type, description, and visual identifiers.
 */
export function searchBeanies(query: string): SearchResult[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);

  const results: SearchResult[] = [];

  for (const beanie of beanies) {
    let score = 0;
    const nameLower = beanie.name.toLowerCase();
    const animalLower = beanie.animal_type.toLowerCase();
    const descLower = beanie.description.toLowerCase();

    // Exact name match (highest priority)
    if (nameLower === normalizedQuery) {
      score += 100;
    }
    // Name starts with query
    else if (nameLower.startsWith(normalizedQuery)) {
      score += 80;
    }
    // Name contains query
    else if (nameLower.includes(normalizedQuery)) {
      score += 60;
    }

    // Animal type exact match
    if (animalLower === normalizedQuery) {
      score += 75;
    }
    // Animal type starts with query
    else if (animalLower.startsWith(normalizedQuery)) {
      score += 65;
    }
    // Animal type contains query
    else if (animalLower.includes(normalizedQuery)) {
      score += 50;
    }

    // Multi-word query matching (e.g., "purple bear")
    if (queryWords.length > 1) {
      let wordMatches = 0;
      for (const word of queryWords) {
        if (word.length < 2) continue;
        if (
          nameLower.includes(word) ||
          animalLower.includes(word) ||
          descLower.includes(word)
        ) {
          wordMatches++;
        }
      }
      if (wordMatches === queryWords.length) {
        score += 55; // All words matched
      } else if (wordMatches > 0) {
        score += wordMatches * 15; // Partial word matches
      }
    }

    // Description contains query
    if (descLower.includes(normalizedQuery)) {
      score += 40;
    }

    // Visual identifiers match
    if (beanie.visual_identifiers) {
      for (const identifier of beanie.visual_identifiers) {
        if (identifier.toLowerCase().includes(normalizedQuery)) {
          score += 35;
          break;
        }
      }
    }

    // Special notes match (for things like "Original 9")
    if (beanie.special_notes?.toLowerCase().includes(normalizedQuery)) {
      score += 30;
    }

    // Only include if there's some match
    if (score > 0) {
      results.push({
        name: beanie.name,
        animal_type: beanie.animal_type,
        description: beanie.description,
        score,
      });
    }
  }

  // Sort by score descending, then alphabetically by name
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.name.localeCompare(b.name);
  });

  // Return top 5 results
  return results.slice(0, 5);
}

/**
 * Get all Beanies for browsing (sorted alphabetically)
 */
export function getAllBeanies(): SearchResult[] {
  return beanies
    .map((beanie) => ({
      name: beanie.name,
      animal_type: beanie.animal_type,
      description: beanie.description,
      score: 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
