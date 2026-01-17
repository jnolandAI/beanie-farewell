import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CollectionItem } from '../types/beanie';

interface CollectionStore {
  collection: CollectionItem[];
  isHydrated: boolean;
  pendingThumbnail: string | null;  // Temporary storage for scan image

  // Actions
  addItem: (item: CollectionItem) => void;
  removeItem: (id: string) => void;
  clearCollection: () => void;
  setHydrated: (state: boolean) => void;
  setPendingThumbnail: (thumbnail: string | null) => void;

  // Computed values
  getTotalValue: () => { low: number; high: number };
  getItemCount: () => number;
}

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set, get) => ({
      collection: [],
      isHydrated: false,
      pendingThumbnail: null,

      addItem: (item: CollectionItem) => {
        set((state) => ({
          collection: [item, ...state.collection], // Newest first
        }));
      },

      setPendingThumbnail: (thumbnail: string | null) => {
        set({ pendingThumbnail: thumbnail });
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
    }),
    {
      name: 'beanie-collection',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({ collection: state.collection }),
    }
  )
);

// Helper to generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
