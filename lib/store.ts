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
        const today = new Date().toISOString().split('T')[0];
        const { lastScanDate, currentStreak, completedChallengeIds } = get();

        // Update streak
        let newStreak = currentStreak;
        if (lastScanDate !== today) {
          // Check if yesterday was scanned (streak continues)
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (lastScanDate === yesterdayStr) {
            newStreak = currentStreak + 1;
          } else if (lastScanDate !== today) {
            // Streak broken or first scan
            newStreak = 1;
          }
        }

        // Calculate new collection size after adding
        const newCollectionSize = get().collection.length + 1;
        const { achievedMilestones } = get();

        // Check for milestone
        const newMilestone = COLLECTION_MILESTONES.find(
          m => m.count === newCollectionSize && !achievedMilestones.includes(m.count)
        );

        // Check for streak milestone
        const { achievedStreakMilestones } = get();
        const newStreakMilestone = STREAK_MILESTONES.find(
          m => newStreak >= m.days && !achievedStreakMilestones.includes(m.days)
        );

        set((state) => ({
          collection: [item, ...state.collection],
          currentStreak: newStreak,
          longestStreak: Math.max(state.longestStreak, newStreak),
          lastScanDate: today,
          achievedMilestones: newMilestone
            ? [...state.achievedMilestones, newMilestone.count]
            : state.achievedMilestones,
          pendingMilestone: newMilestone || state.pendingMilestone,
          achievedStreakMilestones: newStreakMilestone
            ? [...state.achievedStreakMilestones, newStreakMilestone.days]
            : state.achievedStreakMilestones,
          pendingStreakMilestone: newStreakMilestone || state.pendingStreakMilestone,
        }));

        // Check daily challenge completion
        const todaysScans = get().getTodaysScans();
        const challenge = get().getDailyChallenge();

        if (!completedChallengeIds.includes(challenge.id)) {
          const completed = checkChallengeCompletion(challenge, item, todaysScans);
          if (completed) {
            const { lastKnownLevel, totalXP } = get();
            const newTotalXP = totalXP + challenge.xpReward;
            const newLevel = calculateLevel(newTotalXP);

            // Check for level up
            const leveledUp = newLevel.level > lastKnownLevel;

            set((state) => ({
              completedChallengeIds: [...state.completedChallengeIds, challenge.id],
              totalXP: newTotalXP,
              lastKnownLevel: newLevel.level,
              pendingChallengeReward: { ...challenge, completed: true },
              pendingLevelUp: leveledUp ? {
                level: newLevel.level,
                title: newLevel.title,
                emoji: newLevel.emoji,
                color: newLevel.color,
              } : state.pendingLevelUp,
            }));
          }
        }

        // Check for new achievements after adding
        get().checkAndUnlockAchievements();

        // Lucky scan bonus - 10% chance for 2x-5x XP multiplier
        const luckyRoll = Math.random();
        if (luckyRoll < 0.10) {  // 10% chance
          // Determine multiplier: 70% 2x, 20% 3x, 8% 4x, 2% 5x
          const multiplierRoll = Math.random();
          let multiplier = 2;
          if (multiplierRoll > 0.98) multiplier = 5;
          else if (multiplierRoll > 0.90) multiplier = 4;
          else if (multiplierRoll > 0.70) multiplier = 3;

          const baseXP = 10;  // Base scan XP
          const bonusXP = baseXP * multiplier;

          const { lastKnownLevel, totalXP } = get();
          const newTotalXP = totalXP + bonusXP;
          const newLevel = calculateLevel(newTotalXP);
          const leveledUp = newLevel.level > lastKnownLevel;

          set({
            totalXP: newTotalXP,
            lastKnownLevel: newLevel.level,
            pendingLuckyBonus: { xp: bonusXP, multiplier },
            pendingLevelUp: leveledUp ? {
              level: newLevel.level,
              title: newLevel.title,
              emoji: newLevel.emoji,
              color: newLevel.color,
            } : get().pendingLevelUp,
          });
        }

        // Check for value milestone
        const newTotalValue = get().getTotalValue();
        const { achievedValueMilestones } = get();
        const newValueMilestone = VALUE_MILESTONES.find(
          m => newTotalValue.high >= m.value && !achievedValueMilestones.includes(m.value)
        );

        if (newValueMilestone) {
          set((state) => ({
            achievedValueMilestones: [...state.achievedValueMilestones, newValueMilestone.value],
            pendingValueMilestone: newValueMilestone,
          }));
        }
      },

      setPendingThumbnail: (thumbnail: string | null) => {
        set({ pendingThumbnail: thumbnail });
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
        const today = new Date().toISOString().split('T')[0];
        const { lastLoginDate, currentStreak, lastKnownLevel, totalXP } = get();

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
          } : get().pendingLevelUp,
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

      addXP: (amount: number) => {
        const { lastKnownLevel, totalXP } = get();
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
          } : get().pendingLevelUp,
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
