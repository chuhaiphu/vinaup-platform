import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import {
  PERSONAL_UTILITY_KEYS,
  STORAGE_KEYS,
  type PersonalUtilityKey,
} from '@/constants/app-constants';

interface PersonalUtilitiesStore {
  selectedUtilities: PersonalUtilityKey[];
  toggleUtility: (key: PersonalUtilityKey) => void;
  setUtilities: (utilities: PersonalUtilityKey[]) => void;
  resetUtilities: () => void;
}

export const usePersonalUtilitiesStore = create<PersonalUtilitiesStore>()(
  persist(
    (set) => ({
      selectedUtilities: [
        PERSONAL_UTILITY_KEYS.PROJECT,
        PERSONAL_UTILITY_KEYS.WAGE,
        PERSONAL_UTILITY_KEYS.CALENDAR,
      ],
      toggleUtility: (key) =>
        set((state) => {
          const isSelected = state.selectedUtilities.includes(key);
          if (isSelected) {
            return {
              selectedUtilities: state.selectedUtilities.filter((utility) => utility !== key),
            };
          }
          return {
            selectedUtilities: [...state.selectedUtilities, key],
          };
        }),
      setUtilities: (utilities) => set({ selectedUtilities: utilities }),
      resetUtilities: () => set({ selectedUtilities: [] }),
    }),
    {
      name: STORAGE_KEYS.PERSONAL_UTILITIES,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
