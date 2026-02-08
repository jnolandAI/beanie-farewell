import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CollectionItem } from '../types/beanie';
import { Achievement, checkAchievements } from './achievements';
import { DailyChallenge, getDailyChallenge, checkChallengeCompletion, calculateLevel } from './challenges';
import { CollectionMilestone, COLLECTION_MILESTONES } from '../components/MilestoneToast';
import { StreakMilestone, STREAK_MILESTONES } from '../components/StreakMilestoneToast';
import { ValueMilestone, VALUE_MILESTONES } from '../components/ValueMilestoneToast';

interface CollectionStore {
  collection: CollectionItem[];
  isHydrated: boolean;
  pendingThumbnail: string | null;  // Temporary storage for scan image
  pendingResultParams: Record<string, string> | null;  // Params for result screen (bypass URL params)
  userName: string | null;  // User's first name for certificates
  hasCompletedOnboarding: boolean;  // Whether user has entered their name
  unlockedAchievements: string[];  // IDs of unlocked achievements
  pendingAchievementNotifications: Achievement[];  // Newly unlocked, awaiting display
  achievedMilestones: number[];  // Collection count milestones reached (5, 10, 25, etc.)
  pendingMilestone: CollectionMilestone | null;  // Milestone awaiting display

  // Streak & Challenge tracking
  currentStreak: number;
  longestStreak: number;  // Personal best streak
  lastScanDate: string | null;  // ISO date string (YYYY-MM-DD)
  totalXP: number;
  lastKnownLevel: number;  // Track level for level-up detection
  completedChallengeIds: string[];  // IDs of completed daily challenges
  pendingChallengeReward: DailyChallenge | null;  // Challenge just completed, awaiting display
  pendingLevelUp: { level: number; title: string; emoji: string; color: string } | null;  // Level up awaiting display
  lastLoginDate: string | null;  // Track daily login bonus
  pendingLoginBonus: { xp: number; streak: number } | null;  // Login bonus awaiting display
  pendingLuckyBonus: { xp: number; multiplier: number } | null;  // Lucky scan bonus awaiting display
  achievedStreakMilestones: number[];  // Streak milestones reached (7, 14, 30 days)
  pendingStreakMilestone: StreakMilestone | null;  // Streak milestone awaiting display
  achievedValueMilestones: number[];  // Value milestones reached ($100, $500, $1000)
  pendingValueMilestone: ValueMilestone | null;  // Value milestone awaiting display

  // Actions
  addItem: (item: CollectionItem) => void;
  removeItem: (id: string) => void;
  clearCollection: () => void;
  setHydrated: (state: boolean) => void;
  setPendingThumbnail: (thumbnail: string | null) => void;
  setPendingResultParams: (params: Record<string, string> | null) => void;
  setUserName: (name: string) => void;
  completeOnboarding: () => void;
  checkAndUnlockAchievements: () => Achievement[];  // Returns newly unlocked
  clearPendingAchievements: () => void;
  clearPendingChallengeReward: () => void;
  clearPendingLevelUp: () => void;
  clearPendingMilestone: () => void;
  addXP: (amount: number) => void;
  checkDailyLoginBonus: () => void;  // Check and award daily login XP
  clearPendingLoginBonus: () => void;
  clearPendingLuckyBonus: () => void;
  clearPendingStreakMilestone: () => void;
  clearPendingValueMilestone: () => void;
  resetAllData: () => void;  // Reset everything for testing

  // Computed values
  getTotalValue: () => { low: number; high: number };
  getItemCount: () => number;
  getStreak: () => number;
  getTodaysScans: () => CollectionItem[];
  getDailyChallenge: () => DailyChallenge;
}

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set, get) => ({
      collection: [],
      isHydrated: false,
      pendingThumbnail: null,
      pendingResultParams: null,
      userName: null,
      hasCompletedOnboarding: false,
      unlockedAchievements: [],
      pendingAchievementNotifications: [],
      achievedMilestones: [],
      pendingMilestone: null,
      currentStreak: 0,
      longestStreak: 0,
      lastScanDate: null,
      totalXP: 0,
      lastKnownLevel: 1,
      completedChallengeIds: [],
      pendingChallengeReward: null,
      pendingLevelUp: null,
      lastLoginDate: null,
      pendingLoginBonus: null,
      pendingLuckyBonus: null,
      achievedStreakMilestones: [],
      pendingStreakMilestone: null,
      achievedValueMilestones: [],
      pendingValueMilestone: null,

      addItem: (item: CollectionItem) => {
        // Read ALL state once at start to prevent race conditions
        const state = get();
        const {
          collection,
          lastScanDate,
          currentStreak,
          longestStreak,
          completedChallengeIds,
          achievedMilestones,
          achievedStreakMilestones,
          achievedValueMilestones,
          unlockedAchievements,
          lastKnownLevel,
          totalXP,
          pendingMilestone,
          pendingStreakMilestone,
          pendingLevelUp,
          pendingAchievementNotifications,
        } = state;

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Calculate new streak
        let newStreak = currentStreak;
        if (lastScanDate !== today) {
          if (lastScanDate === yesterdayStr) {
            newStreak = currentStreak + 1;
          } else {
            newStreak = 1;
          }
        }

        // Calculate new collection with item added
        const newCollection = [item, ...collection];
        const newCollectionSize = newCollection.length;

        // Check for collection milestone
        const newMilestone = COLLECTION_MILESTONES.find(
          m => m.count === newCollectionSize && !achievedMilestones.includes(m.count)
        );

        // Check for streak milestone
        const newStreakMilestone = STREAK_MILESTONES.find(
          m => newStreak >= m.days && !achievedStreakMilestones.includes(m.days)
        );

        // Calculate today's scans (including new item)
        const todaysScans = newCollection.filter(i => {
          const itemDate = new Date(i.timestamp).toISOString().split('T')[0];
          return itemDate === today;
        });

        // Get daily challenge
        const challenge = getDailyChallenge();
        const challengeAlreadyCompleted = completedChallengeIds.includes(challenge.id);

        // Check if challenge just completed
        let challengeJustCompleted = false;
        if (!challengeAlreadyCompleted) {
          challengeJustCompleted = checkChallengeCompletion(challenge, item, todaysScans);
        }

        // Calculate XP changes
        let runningXP = totalXP;
        let runningLevel = lastKnownLevel;
        let newPendingChallengeReward: DailyChallenge | null = null;
        let newPendingLevelUp = pendingLevelUp;

        if (challengeJustCompleted) {
          runningXP += challenge.xpReward;
          const levelInfo = calculateLevel(runningXP);
          if (levelInfo.level > runningLevel) {
            newPendingLevelUp = {
              level: levelInfo.level,
              title: levelInfo.title,
              emoji: levelInfo.emoji,
              color: levelInfo.color,
            };
          }
          runningLevel = levelInfo.level;
          newPendingChallengeReward = { ...challenge, completed: true };
        }

        // Lucky scan bonus - 10% chance for 2x-5x XP multiplier
        let newPendingLuckyBonus: { xp: number; multiplier: number } | null = null;
        const luckyRoll = Math.random();
        if (luckyRoll < 0.10) {
          const multiplierRoll = Math.random();
          let multiplier = 2;
          if (multiplierRoll > 0.98) multiplier = 5;
          else if (multiplierRoll > 0.90) multiplier = 4;
          else if (multiplierRoll > 0.70) multiplier = 3;

          const bonusXP = 10 * multiplier;
          runningXP += bonusXP;
          const levelInfo = calculateLevel(runningXP);
          if (levelInfo.level > runningLevel) {
            newPendingLevelUp = {
              level: levelInfo.level,
              title: levelInfo.title,
              emoji: levelInfo.emoji,
              color: levelInfo.color,
            };
          }
          runningLevel = levelInfo.level;
          newPendingLuckyBonus = { xp: bonusXP, multiplier };
        }

        // Calculate new total value for value milestone check
        const newTotalValue = newCollection.reduce(
          (acc, i) => ({
            low: acc.low + (i.adjusted_value_low ?? i.estimated_value_low),
            high: acc.high + (i.adjusted_value_high ?? i.estimated_value_high),
          }),
          { low: 0, high: 0 }
        );

        // Check for value milestone
        const newValueMilestone = VALUE_MILESTONES.find(
          m => newTotalValue.high >= m.value && !achievedValueMilestones.includes(m.value)
        );

        // Check for new achievements
        const newlyUnlockedAchievements = checkAchievements(newCollection, unlockedAchievements);

        // Single atomic state update
        set({
          collection: newCollection,
          currentStreak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
          lastScanDate: today,
          totalXP: runningXP,
          lastKnownLevel: runningLevel,
          // Milestones
          achievedMilestones: newMilestone
            ? [...achievedMilestones, newMilestone.count]
            : achievedMilestones,
          pendingMilestone: newMilestone || pendingMilestone,
          // Streak milestones
          achievedStreakMilestones: newStreakMilestone
            ? [...achievedStreakMilestones, newStreakMilestone.days]
            : achievedStreakMilestones,
          pendingStreakMilestone: newStreakMilestone || pendingStreakMilestone,
          // Challenge completion
          completedChallengeIds: challengeJustCompleted
            ? [...completedChallengeIds, challenge.id]
            : completedChallengeIds,
          pendingChallengeReward: newPendingChallengeReward,
          // Level up
          pendingLevelUp: newPendingLevelUp,
          // Lucky bonus
          pendingLuckyBonus: newPendingLuckyBonus,
          // Value milestones
          achievedValueMilestones: newValueMilestone
            ? [...achievedValueMilestones, newValueMilestone.value]
            : achievedValueMilestones,
          pendingValueMilestone: newValueMilestone || null,
          // Achievements
          unlockedAchievements: newlyUnlockedAchievements.length > 0
            ? [...unlockedAchievements, ...newlyUnlockedAchievements.map(a => a.id)]
            : unlockedAchievements,
          pendingAchievementNotifications: newlyUnlockedAchievements.length > 0
            ? [...pendingAchievementNotifications, ...newlyUnlockedAchievements]
            : pendingAchievementNotifications,
        });
      },

      setPendingThumbnail: (thumbnail: string | null) => {
        set({ pendingThumbnail: thumbnail });
      },

      setPendingResultParams: (params: Record<string, string> | null) => {
        set({ pendingResultParams: params });
      },

      setUserName: (name: string) => {
        set({ userName: name });
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      checkAndUnlockAchievements: () => {
        const { collection, unlockedAchievements } = get();
        const newlyUnlocked = checkAchievements(collection, unlockedAchievements);

        if (newlyUnlocked.length > 0) {
          set((state) => ({
            unlockedAchievements: [
              ...state.unlockedAchievements,
              ...newlyUnlocked.map(a => a.id),
            ],
            pendingAchievementNotifications: [
              ...state.pendingAchievementNotifications,
              ...newlyUnlocked,
            ],
          }));
        }

        return newlyUnlocked;
      },

      clearPendingAchievements: () => {
        set({ pendingAchievementNotifications: [] });
      },

      clearPendingChallengeReward: () => {
        set({ pendingChallengeReward: null });
      },

      clearPendingLevelUp: () => {
        set({ pendingLevelUp: null });
      },

      clearPendingMilestone: () => {
        set({ pendingMilestone: null });
      },

      checkDailyLoginBonus: () => {
        // Read all state once at start
        const { lastLoginDate, currentStreak, lastKnownLevel, totalXP, pendingLevelUp } = get();
        const today = new Date().toISOString().split('T')[0];

        // Already logged in today
        if (lastLoginDate === today) return;

        // Calculate login streak bonus
        // Base: 10 XP, +5 per streak day (max +50), so 10-60 XP possible
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let loginStreak = 1;
        if (lastLoginDate === yesterdayStr) {
          loginStreak = Math.min(currentStreak + 1, 10);  // Cap at 10 day multiplier
        }

        const bonusXP = 10 + (loginStreak - 1) * 5;

        // Award XP and check for level up
        const newTotalXP = totalXP + bonusXP;
        const newLevel = calculateLevel(newTotalXP);
        const leveledUp = newLevel.level > lastKnownLevel;

        set({
          lastLoginDate: today,
          totalXP: newTotalXP,
          lastKnownLevel: newLevel.level,
          pendingLoginBonus: { xp: bonusXP, streak: loginStreak },
          pendingLevelUp: leveledUp ? {
            level: newLevel.level,
            title: newLevel.title,
            emoji: newLevel.emoji,
            color: newLevel.color,
          } : pendingLevelUp,
        });
      },

      clearPendingLoginBonus: () => {
        set({ pendingLoginBonus: null });
      },

      clearPendingLuckyBonus: () => {
        set({ pendingLuckyBonus: null });
      },

      clearPendingStreakMilestone: () => {
        set({ pendingStreakMilestone: null });
      },

      clearPendingValueMilestone: () => {
        set({ pendingValueMilestone: null });
      },

      resetAllData: () => {
        set({
          collection: [],
          pendingThumbnail: null,
          userName: null,
          hasCompletedOnboarding: false,
          unlockedAchievements: [],
          pendingAchievementNotifications: [],
          achievedMilestones: [],
          pendingMilestone: null,
          currentStreak: 0,
          longestStreak: 0,
          lastScanDate: null,
          totalXP: 0,
          lastKnownLevel: 1,
          completedChallengeIds: [],
          pendingChallengeReward: null,
          pendingLevelUp: null,
          lastLoginDate: null,
          pendingLoginBonus: null,
          pendingLuckyBonus: null,
          achievedStreakMilestones: [],
          pendingStreakMilestone: null,
          achievedValueMilestones: [],
          pendingValueMilestone: null,
        });
      },

      addXP: (amount: number) => {
        // Read all state once at start
        const { lastKnownLevel, totalXP, pendingLevelUp } = get();
        const newTotalXP = totalXP + amount;
        const newLevel = calculateLevel(newTotalXP);

        // Check for level up
        const leveledUp = newLevel.level > lastKnownLevel;

        set({
          totalXP: newTotalXP,
          lastKnownLevel: newLevel.level,
          pendingLevelUp: leveledUp ? {
            level: newLevel.level,
            title: newLevel.title,
            emoji: newLevel.emoji,
            color: newLevel.color,
          } : pendingLevelUp,
        });
      },

      removeItem: (id: string) => {
        set((state) => ({
          collection: state.collection.filter((item) => item.id !== id),
        }));
      },

      clearCollection: () => {
        set({ collection: [] });
      },

      setHydrated: (state: boolean) => {
        set({ isHydrated: state });
      },

      getTotalValue: () => {
        const { collection } = get();
        return collection.reduce(
          (acc, item) => ({
            low: acc.low + (item.adjusted_value_low ?? item.estimated_value_low),
            high: acc.high + (item.adjusted_value_high ?? item.estimated_value_high),
          }),
          { low: 0, high: 0 }
        );
      },

      getItemCount: () => {
        return get().collection.length;
      },

      getStreak: () => {
        const { currentStreak, lastScanDate } = get();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // If last scan was today or yesterday, streak is valid
        if (lastScanDate === today || lastScanDate === yesterdayStr) {
          return currentStreak;
        }
        // Streak broken
        return 0;
      },

      getTodaysScans: () => {
        const { collection } = get();
        const today = new Date().toISOString().split('T')[0];
        return collection.filter(item => {
          const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
          return itemDate === today;
        });
      },

      getDailyChallenge: () => {
        const { completedChallengeIds } = get();
        const challenge = getDailyChallenge();
        return {
          ...challenge,
          completed: completedChallengeIds.includes(challenge.id),
        };
      },
    }),
    {
      name: 'beanie-collection',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        collection: state.collection,
        userName: state.userName,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        unlockedAchievements: state.unlockedAchievements,
        achievedMilestones: state.achievedMilestones,
        achievedStreakMilestones: state.achievedStreakMilestones,
        achievedValueMilestones: state.achievedValueMilestones,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastScanDate: state.lastScanDate,
        totalXP: state.totalXP,
        lastKnownLevel: state.lastKnownLevel,
        completedChallengeIds: state.completedChallengeIds,
        lastLoginDate: state.lastLoginDate,
      }),
    }
  )
);

// Helper to generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
