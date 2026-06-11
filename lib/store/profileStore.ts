import { create } from 'zustand';

interface ProfileStore {
  // Transient UI state shared across the wizard
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;

  // Used by the complete screen to show summary
  apsScore: number;
  setApsScore: (v: number) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  isSaving: false,
  setIsSaving: (v) => set({ isSaving: v }),

  apsScore: 0,
  setApsScore: (v) => set({ apsScore: v }),
}));
