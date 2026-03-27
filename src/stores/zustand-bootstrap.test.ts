import { useDraftStore } from "~/stores/draft-store";
import { usePreferencesStore } from "~/stores/preferences-store";
import { useUiStore } from "~/stores/ui-store";

const uiState = useUiStore.getState();
uiState.openPanel("filters");
uiState.closePanel();
uiState.setCommandMenuOpen(true);

const draftState = useDraftStore.getState();
draftState.upsertDraft("post:1", { title: "Draft title" });
draftState.clearDraft("post:1");

const preferencesState = usePreferencesStore.getState();
preferencesState.setTheme("dark");
preferencesState.addRecentSelection("dashboard");

export const zustandBootstrapSmokeTest = {
  uiState,
  draftState,
  preferencesState,
};
