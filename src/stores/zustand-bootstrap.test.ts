import { expect, test, vi } from "vitest";

import { useDraftStore } from "~/stores/draft-store";
import { usePreferencesStore } from "~/stores/preferences-store";
import { useUiStore } from "~/stores/ui-store";

test("zustand stores bootstrap and accept state updates without browser storage", () => {
  const warnSpy = vi
    .spyOn(console, "warn")
    .mockImplementation((..._args) => undefined);

  const uiState = useUiStore.getState();
  uiState.reset();
  uiState.openPanel("filters");
  expect(useUiStore.getState().activePanel).toBe("filters");
  uiState.closePanel();
  uiState.setCommandMenuOpen(true);
  expect(useUiStore.getState().activePanel).toBeNull();
  expect(useUiStore.getState().isCommandMenuOpen).toBe(true);

  const draftState = useDraftStore.getState();
  draftState.reset();
  draftState.upsertDraft("post:1", { title: "Draft title" });
  expect(useDraftStore.getState().drafts["post:1"]?.title).toBe("Draft title");
  draftState.clearDraft("post:1");
  expect(useDraftStore.getState().drafts["post:1"]).toBeUndefined();

  const preferencesState = usePreferencesStore.getState();
  preferencesState.reset();
  preferencesState.setTheme("dark");
  preferencesState.addRecentSelection("dashboard");
  expect(usePreferencesStore.getState().theme).toBe("dark");
  expect(usePreferencesStore.getState().recentSelections).toContain("dashboard");

  warnSpy.mockRestore();
});
