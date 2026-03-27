"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemePreference = "system" | "light" | "dark";

type PreferencesState = {
  theme: ThemePreference;
  reducedMotion: boolean;
  recentSelections: string[];
};

type PreferencesActions = {
  setTheme: (theme: ThemePreference) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
  addRecentSelection: (selection: string) => void;
  reset: () => void;
};

const initialPreferencesState: PreferencesState = {
  theme: "system",
  reducedMotion: false,
  recentSelections: [],
};

export const usePreferencesStore = create<
  PreferencesState & PreferencesActions
>()(
  persist(
    (set) => ({
      ...initialPreferencesState,
      setTheme: (theme) => set({ theme }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      addRecentSelection: (selection) =>
        set((state) => ({
          recentSelections: [
            selection,
            ...state.recentSelections.filter((item) => item !== selection),
          ].slice(0, 5),
        })),
      reset: () => set(initialPreferencesState),
    }),
    {
      name: "remember5-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ theme, reducedMotion, recentSelections }) => ({
        theme,
        reducedMotion,
        recentSelections,
      }),
    },
  ),
);
