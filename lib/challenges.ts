/**
 * Daily Challenges & Scan Streaks
 * Gamification to encourage daily engagement
 */

import { CollectionItem } from '../types/beanie';

// Daily challenge types
export type ChallengeType =
  | 'scan_any'        // Scan any Beanie
  | 'scan_count'      // Scan X Beanies
  | 'find_animal'     // Find a specific animal type
  | 'find_tier'       // Find a Beanie of specific tier
  | 'find_color'      // Find a Beanie with specific color
  | 'beat_value';     // Find a Beanie worth more than X

export interface DailyChallenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  emoji: string;
  target: number | string;  // Count for scan_count, animal type for find_animal, etc.
  xpReward: number;
  completed: boolean;
}

// Challenge templates
const CHALLENGE_TEMPLATES: Omit<DailyChallenge, 'id' | 'completed'>[] = [
  // Easy challenges
  {
    type: 'scan_any',
    title: 'Daily Scan',
    description: 'Scan any Beanie Baby today',
    emoji: '📸',
    target: 1,
    xpReward: 10,
  },
  {
    type: 'scan_count',
    title: 'Triple Threat',
    description: 'Scan 3 Beanies today',
    emoji: '🎯',
    target: 3,
    xpReward: 30,
  },
  {
    type: 'scan_count',
    title: 'Scanning Spree',
    description: 'Scan 5 Beanies today',
    emoji: '⚡',
    target: 5,
    xpReward: 50,
  },

  // Animal-specific challenges
  {
    type: 'find_animal',
    title: 'Bear Hunt',
    description: 'Find and scan a bear',
    emoji: '🐻',
    target: 'bear',
    xpReward: 25,
  },
  {
    type: 'find_animal',
    title: 'Frog Finder',
    description: 'Find and scan a frog',
    emoji: '🐸',
    target: 'frog',
    xpReward: 25,
  },
  {
    type: 'find_animal',
    title: 'Cat Quest',
    description: 'Find and scan a cat',
    emoji: '🐱',
    target: 'cat',
    xpReward: 25,
  },
  {
    type: 'find_animal',
    title: 'Dog Days',
    description: 'Find and scan a dog',
    emoji: '🐕',
    target: 'dog',
    xpReward: 25,
  },
  {
    type: 'find_animal',
    title: 'Bunny Bounce',
    description: 'Find and scan a bunny or rabbit',
    emoji: '🐰',
    target: 'bunny',
    xpReward: 25,
  },

  // Value challenges
  {
    type: 'find_tier',
    title: 'Hidden Gem',
    description: 'Find a Beanie worth $50+',
    emoji: '💎',
    target: 3,  // Tier 3+
    xpReward: 40,
  },
  {
    type: 'find_tier',
    title: 'Treasure Hunt',
    description: 'Find a Beanie worth $200+',
    emoji: '🏆',
    target: 4,  // Tier 4+
    xpReward: 75,
  },
  {
    type: 'beat_value',
    title: 'Beat $20',
    description: 'Find a Beanie worth more than $20',
    emoji: '💵',
    target: 20,
    xpReward: 20,
  },
  {
    type: 'beat_value',
    title: 'Beat $100',
    description: 'Find a Beanie worth more than $100',
    emoji: '💰',
    target: 100,
    xpReward: 50,
  },

  // Color challenges
  {
    type: 'find_color',
    title: 'Purple Reign',
    description: 'Find a purple Beanie',
    emoji: '💜',
    target: 'purple',
    xpReward: 25,
  },
  {
    type: 'find_color',
    title: 'Feeling Blue',
    description: 'Find a blue Beanie',
    emoji: '💙',
    target: 'blue',
    xpReward: 25,
  },
  {
    type: 'find_color',
    title: 'Red Alert',
    description: 'Find a red Beanie',
    emoji: '❤️',
    target: 'red',
    xpReward: 25,
  },
];

/**
 * Generate a daily challenge based on the date
 * Same challenge for all users on a given day
 */
export function getDailyChallenge(date: Date = new Date()): DailyChallenge {
  // Use date as seed for consistent daily challenge
  const dateString = date.toISOString().split('T')[0];
  const seed = dateString.split('-').reduce((acc, n) => acc + parseInt(n), 0);
  const index = seed % CHALLENGE_TEMPLATES.length;

  const template = CHALLENGE_TEMPLATES[index];

  return {
    ...template,
    id: `daily-${dateString}`,
    completed: false,
  };
}

/**
 * Check if a scan completes the daily challenge
 */
export function checkChallengeCompletion(
  challenge: DailyChallenge,
  newItem: CollectionItem,
  todaysScans: CollectionItem[]
): boolean {
  if (challenge.completed) return false;

  switch (challenge.type) {
    case 'scan_any':
      return true;

    case 'scan_count':
      return todaysScans.length >= (challenge.target as number);

    case 'find_animal':
      const targetAnimal = (challenge.target as string).toLowerCase();
      const itemAnimal = newItem.animal_type.toLowerCase();
      return itemAnimal.includes(targetAnimal) ||
             (targetAnimal === 'bunny' && itemAnimal.includes('rabbit'));

    case 'find_tier':
      return newItem.tier >= (challenge.target as number);

    case 'find_color':
      const targetColor = (challenge.target as string).toLowerCase();
      return newItem.colors.some(c => c.toLowerCase().includes(targetColor));

    case 'beat_value':
      const targetValue = challenge.target as number;
      const itemValue = newItem.adjusted_value_high ?? newItem.estimated_value_high;
      return itemValue > targetValue;

    default:
      return false;
  }
}

/**
 * Streak milestone rewards
 */
export const STREAK_MILESTONES: { days: number; title: string; emoji: string; xpBonus: number }[] = [
  { days: 3, title: '3-Day Streak!', emoji: '🔥', xpBonus: 50 },
  { days: 7, title: 'Week Warrior!', emoji: '⭐', xpBonus: 100 },
  { days: 14, title: 'Two Week Titan!', emoji: '💪', xpBonus: 200 },
  { days: 30, title: 'Monthly Master!', emoji: '👑', xpBonus: 500 },
  { days: 50, title: 'Beanie Legend!', emoji: '🏆', xpBonus: 1000 },
  { days: 100, title: 'Century Scanner!', emoji: '💯', xpBonus: 2500 },
];

/**
 * Get current streak milestone (or next one)
 */
export function getStreakMilestone(currentStreak: number): {
  current: typeof STREAK_MILESTONES[0] | null;
  next: typeof STREAK_MILESTONES[0] | null;
  progress: number;
} {
  let current = null;
  let next = null;

  for (const milestone of STREAK_MILESTONES) {
    if (currentStreak >= milestone.days) {
      current = milestone;
    } else {
      next = milestone;
      break;
    }
  }

  const progress = next
    ? Math.round((currentStreak / next.days) * 100)
    : 100;

  return { current, next, progress };
}

/**
 * Get motivational message based on streak
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) {
    return "Start your streak today!";
  } else if (streak === 1) {
    return "Day 1! Keep it going!";
  } else if (streak < 3) {
    return `${streak} days! Almost at your first milestone!`;
  } else if (streak < 7) {
    return `${streak} day streak! 🔥 Going strong!`;
  } else if (streak < 14) {
    return `${streak} days! You're on fire! 🔥🔥`;
  } else if (streak < 30) {
    return `${streak} day streak! Incredible dedication!`;
  } else {
    return `${streak} DAYS! You're a Beanie legend! 🏆`;
  }
}

/**
 * Level titles based on level number
 */
export const LEVEL_TITLES: { minLevel: number; title: string; emoji: string; color: string }[] = [
  { minLevel: 1, title: 'Beanie Newbie', emoji: '🐣', color: '#9CA3AF' },
  { minLevel: 3, title: 'Beanie Scout', emoji: '🔍', color: '#00CED1' },
  { minLevel: 5, title: 'Beanie Hunter', emoji: '🎯', color: '#8B5CF6' },
  { minLevel: 8, title: 'Beanie Expert', emoji: '⭐', color: '#FFD700' },
  { minLevel: 12, title: 'Beanie Master', emoji: '🏆', color: '#FF6B35' },
  { minLevel: 15, title: 'Beanie Legend', emoji: '👑', color: '#FF00FF' },
  { minLevel: 20, title: 'Beanie Overlord', emoji: '🔱', color: '#FF1493' },
  { minLevel: 25, title: 'Beanie God', emoji: '✨', color: '#FF00FF' },
];

/**
 * Get level title based on level number
 */
export function getLevelTitle(level: number): { title: string; emoji: string; color: string } {
  let title = LEVEL_TITLES[0];
  for (const t of LEVEL_TITLES) {
    if (level >= t.minLevel) {
      title = t;
    } else {
      break;
    }
  }
  return { title: title.title, emoji: title.emoji, color: title.color };
}

/**
 * Calculate XP level from total XP
 */
export function calculateLevel(totalXP: number): {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  progress: number;
  title: string;
  emoji: string;
  color: string;
} {
  // XP curve: Level N requires N * 100 XP
  // Level 1: 100 XP, Level 2: 200 XP, Level 3: 300 XP, etc.
  let level = 1;
  let xpNeeded = 100;
  let xpSpent = 0;

  while (totalXP >= xpSpent + xpNeeded) {
    xpSpent += xpNeeded;
    level++;
    xpNeeded = level * 100;
  }

  const currentXP = totalXP - xpSpent;
  const { title, emoji, color } = getLevelTitle(level);

  return {
    level,
    currentXP,
    nextLevelXP: xpNeeded,
    progress: Math.round((currentXP / xpNeeded) * 100),
    title,
    emoji,
    color,
  };
}
