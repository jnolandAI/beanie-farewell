/**
 * Achievements system for Bean Bye
 * Gamification to encourage scanning and collection building
 */

import { CollectionItem } from '../types/beanie';

// Achievement definition
export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'collection' | 'value' | 'discovery' | 'dedication';
  secret?: boolean;  // Hidden until unlocked
  unlockedAt?: number;  // Timestamp when unlocked
}

// All available achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Collection milestones
  {
    id: 'first_scan',
    name: 'Baby Steps',
    description: 'Scan your first Beanie Baby',
    emoji: '👶',
    category: 'collection',
  },
  {
    id: 'collection_5',
    name: 'Getting Started',
    description: 'Build a collection of 5 Beanies',
    emoji: '📦',
    category: 'collection',
  },
  {
    id: 'collection_10',
    name: 'Dedicated Collector',
    description: 'Build a collection of 10 Beanies',
    emoji: '🗃️',
    category: 'collection',
  },
  {
    id: 'collection_25',
    name: 'Serious Hoarder',
    description: 'Build a collection of 25 Beanies',
    emoji: '🏠',
    category: 'collection',
  },
  {
    id: 'collection_50',
    name: 'Beanie Warehouse',
    description: 'Build a collection of 50 Beanies',
    emoji: '🏭',
    category: 'collection',
  },
  {
    id: 'collection_100',
    name: 'Beanie Empire',
    description: 'Build a collection of 100 Beanies',
    emoji: '👑',
    category: 'collection',
    secret: true,
  },

  // Value discoveries
  {
    id: 'found_tier3',
    name: 'Hidden Gem',
    description: 'Find a Beanie worth $50+',
    emoji: '💎',
    category: 'value',
  },
  {
    id: 'found_tier4',
    name: 'Treasure Hunter',
    description: 'Find a Beanie worth $200+',
    emoji: '🏆',
    category: 'value',
  },
  {
    id: 'found_tier5',
    name: 'Jackpot!',
    description: 'Find a Beanie worth $1,000+',
    emoji: '🎰',
    category: 'value',
  },
  {
    id: 'total_value_100',
    name: 'Triple Digits',
    description: 'Collection total reaches $100+',
    emoji: '💵',
    category: 'value',
  },
  {
    id: 'total_value_500',
    name: 'Half Grand',
    description: 'Collection total reaches $500+',
    emoji: '💰',
    category: 'value',
  },
  {
    id: 'total_value_1000',
    name: 'Grand Collection',
    description: 'Collection total reaches $1,000+',
    emoji: '🤑',
    category: 'value',
  },

  // Discovery achievements
  {
    id: 'found_bear',
    name: 'Bear Necessities',
    description: 'Scan your first bear',
    emoji: '🐻',
    category: 'discovery',
  },
  {
    id: 'variety_5',
    name: 'Animal Kingdom',
    description: 'Collect 5 different animal types',
    emoji: '🦁',
    category: 'discovery',
  },
  {
    id: 'variety_10',
    name: 'Noah\'s Ark',
    description: 'Collect 10 different animal types',
    emoji: '🚢',
    category: 'discovery',
  },
  {
    id: 'found_original9',
    name: 'OG Collector',
    description: 'Find one of the Original 9 Beanies',
    emoji: '⭐',
    category: 'discovery',
  },
  {
    id: 'found_princess',
    name: 'Royal Discovery',
    description: 'Find a Princess bear',
    emoji: '👸',
    category: 'discovery',
  },
  {
    id: 'found_rare_variant',
    name: 'Variant Hunter',
    description: 'Find a rare color variant',
    emoji: '🌈',
    category: 'discovery',
    secret: true,
  },

  // Dedication achievements
  {
    id: 'scan_same_day_3',
    name: 'Scanning Spree',
    description: 'Scan 3 Beanies in one day',
    emoji: '⚡',
    category: 'dedication',
  },
  {
    id: 'scan_same_day_10',
    name: 'Marathon Scanner',
    description: 'Scan 10 Beanies in one day',
    emoji: '🏃',
    category: 'dedication',
  },
  {
    id: 'all_tiers',
    name: 'Full Spectrum',
    description: 'Find Beanies from all 5 value tiers',
    emoji: '🌈',
    category: 'dedication',
  },
  {
    id: 'week_streak',
    name: 'Weekly Warrior',
    description: 'Scan at least one Beanie for 7 days',
    emoji: '📅',
    category: 'dedication',
    secret: true,
  },
];

// Original 9 Beanie names for achievement detection
const ORIGINAL_9 = [
  'legs', 'squealer', 'spot', 'flash', 'splash',
  'chocolate', 'patti', 'brownie', 'punchers'
];

// Rare variant indicators
const RARE_VARIANTS = [
  'royal blue', 'old face', 'nana', 'employee',
  'pvc', '1st gen', '2nd gen', 'error'
];

/**
 * Check which achievements should be unlocked based on collection state
 */
export function checkAchievements(
  collection: CollectionItem[],
  currentlyUnlocked: string[]
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];
  const now = Date.now();

  // Helper to unlock if not already
  const tryUnlock = (id: string) => {
    if (!currentlyUnlocked.includes(id)) {
      const achievement = ACHIEVEMENTS.find(a => a.id === id);
      if (achievement) {
        newlyUnlocked.push({ ...achievement, unlockedAt: now });
      }
    }
  };

  // Collection size achievements
  if (collection.length >= 1) tryUnlock('first_scan');
  if (collection.length >= 5) tryUnlock('collection_5');
  if (collection.length >= 10) tryUnlock('collection_10');
  if (collection.length >= 25) tryUnlock('collection_25');
  if (collection.length >= 50) tryUnlock('collection_50');
  if (collection.length >= 100) tryUnlock('collection_100');

  // Calculate total value
  const totalValueHigh = collection.reduce(
    (sum, item) => sum + (item.adjusted_value_high ?? item.estimated_value_high),
    0
  );

  // Value achievements
  if (totalValueHigh >= 100) tryUnlock('total_value_100');
  if (totalValueHigh >= 500) tryUnlock('total_value_500');
  if (totalValueHigh >= 1000) tryUnlock('total_value_1000');

  // Check for tier achievements
  const tiers = new Set(collection.map(item => item.tier));
  if (collection.some(item => item.tier >= 3)) tryUnlock('found_tier3');
  if (collection.some(item => item.tier >= 4)) tryUnlock('found_tier4');
  if (collection.some(item => item.tier >= 5)) tryUnlock('found_tier5');
  if (tiers.size >= 5) tryUnlock('all_tiers');

  // Animal type variety
  const animalTypes = new Set(collection.map(item => item.animal_type.toLowerCase()));
  if (animalTypes.size >= 5) tryUnlock('variety_5');
  if (animalTypes.size >= 10) tryUnlock('variety_10');

  // Bear achievement
  if (collection.some(item => item.animal_type.toLowerCase().includes('bear'))) {
    tryUnlock('found_bear');
  }

  // Original 9 achievement
  if (collection.some(item => ORIGINAL_9.includes(item.name.toLowerCase()))) {
    tryUnlock('found_original9');
  }

  // Princess achievement
  if (collection.some(item => item.name.toLowerCase().includes('princess'))) {
    tryUnlock('found_princess');
  }

  // Rare variant achievement
  if (collection.some(item => {
    const variant = (item.variant || '').toLowerCase();
    const notes = (item.value_notes || '').toLowerCase();
    return RARE_VARIANTS.some(rv => variant.includes(rv) || notes.includes(rv));
  })) {
    tryUnlock('found_rare_variant');
  }

  // Same day scanning achievements
  const today = new Date().toDateString();
  const scansToday = collection.filter(
    item => new Date(item.timestamp).toDateString() === today
  ).length;
  if (scansToday >= 3) tryUnlock('scan_same_day_3');
  if (scansToday >= 10) tryUnlock('scan_same_day_10');

  // Week streak achievement
  const lastWeekDates = new Set<string>();
  const now7DaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  collection.forEach(item => {
    if (item.timestamp >= now7DaysAgo) {
      lastWeekDates.add(new Date(item.timestamp).toDateString());
    }
  });
  if (lastWeekDates.size >= 7) tryUnlock('week_streak');

  return newlyUnlocked;
}

/**
 * Get achievement progress for display
 */
export function getAchievementProgress(
  collection: CollectionItem[],
  unlockedIds: string[]
): { unlocked: number; total: number; percentage: number } {
  const visibleAchievements = ACHIEVEMENTS.filter(a => !a.secret || unlockedIds.includes(a.id));
  const unlocked = unlockedIds.length;
  const total = visibleAchievements.length;
  const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return { unlocked, total, percentage };
}

/**
 * Get all achievements with unlock status
 */
export function getAllAchievements(unlockedIds: string[]): Achievement[] {
  return ACHIEVEMENTS.map(achievement => ({
    ...achievement,
    unlockedAt: unlockedIds.includes(achievement.id) ? Date.now() : undefined,
  })).filter(a => !a.secret || unlockedIds.includes(a.id));
}

/**
 * Get category display info
 */
export const ACHIEVEMENT_CATEGORIES = {
  collection: { name: 'Collection', emoji: '📦', color: '#8B5CF6' },
  value: { name: 'Value', emoji: '💰', color: '#FFD700' },
  discovery: { name: 'Discovery', emoji: '🔍', color: '#00CED1' },
  dedication: { name: 'Dedication', emoji: '⭐', color: '#FF6B35' },
};
