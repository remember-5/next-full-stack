"use client";

import { create } from "zustand";

export type UiPanel = "filters" | "profile" | null;

type UiState = {
  activePanel: UiPanel;
  isCommandMenuOpen: boolean;
};

type UiActions = {
  openPanel: (panel: Exclude<UiPanel, null>) => void;
  closePanel: () => void;
  setCommandMenuOpen: (isOpen: boolean) => void;
  reset: () => void;
};

const initialUiState: UiState = {
  activePanel: null,
  isCommandMenuOpen: false,
};

export const useUiStore = create<UiState & UiActions>((set) => ({
  ...initialUiState,
  openPanel: (activePanel) => set({ activePanel }),
  closePanel: () => set({ activePanel: null }),
  setCommandMenuOpen: (isCommandMenuOpen) => set({ isCommandMenuOpen }),
  reset: () => set(initialUiState),
}));
