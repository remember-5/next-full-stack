"use client";

import { create } from "zustand";

export type DraftValue = {
  title: string;
  body: string;
  updatedAt: number;
};

type DraftPatch = Partial<Pick<DraftValue, "title" | "body">>;

type DraftState = {
  drafts: Record<string, DraftValue>;
};

type DraftActions = {
  upsertDraft: (key: string, patch: DraftPatch) => void;
  clearDraft: (key: string) => void;
  reset: () => void;
};

const initialDraftState: DraftState = {
  drafts: {},
};

export const useDraftStore = create<DraftState & DraftActions>((set) => ({
  ...initialDraftState,
  upsertDraft: (key, patch) =>
    set((state) => {
      const previous = state.drafts[key] ?? {
        title: "",
        body: "",
        updatedAt: Date.now(),
      };

      return {
        drafts: {
          ...state.drafts,
          [key]: {
            title: patch.title ?? previous.title,
            body: patch.body ?? previous.body,
            updatedAt: Date.now(),
          },
        },
      };
    }),
  clearDraft: (key) =>
    set((state) => {
      const nextDrafts = { ...state.drafts };
      delete nextDrafts[key];

      return { drafts: nextDrafts };
    }),
  reset: () => set(initialDraftState),
}));
