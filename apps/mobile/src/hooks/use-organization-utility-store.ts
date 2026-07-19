import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/app-constants';

interface OrganizationUtilitiesStore {
  selections: Record<string, string[]>;
  toggleUtility: (orgId: string, key: string) => void;
  setUtilities: (orgId: string, utilities: string[]) => void;
  resetUtilities: (orgId: string) => void;
}

export const useOrganizationUtilitiesStore = create<OrganizationUtilitiesStore>()(
  persist(
    (set) => ({
      selections: {},

      toggleUtility: (orgId, key) =>
        set((state) => {
          const current = state.selections[orgId] ?? [];

          const isSelected = current.includes(key);
          const updated = isSelected ? current.filter((k) => k !== key) : [...current, key];

          // immutably update for current organization selection list
          const newSelections = { ...state.selections };
          newSelections[orgId] = updated;

          return { selections: newSelections };
        }),

      setUtilities: (orgId, utilities) =>
        set((state) => {
          const newSelections = { ...state.selections };
          newSelections[orgId] = utilities;
          return { selections: newSelections };
        }),

      // remove this org's entry entirely from selections
      resetUtilities: (orgId) =>
        set((state) => {
          const toBeDeleted = { ...state.selections };
          delete toBeDeleted[orgId];
          return { selections: toBeDeleted };
        }),
    }),
    {
      name: STORAGE_KEYS.ORGANIZATION_UTILITIES,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
