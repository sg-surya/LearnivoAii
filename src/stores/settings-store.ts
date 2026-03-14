
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ProfileSettings = {
  fullName: string;
  schoolName?: string;
  subjects?: string;
  grades?: string;
  photoUrl?: string;
  coverUrl?: string;
};

export type AISettings = {
  defaultLanguage: string;
  defaultGrade: string;
  creativityLevel: 'precise' | 'balanced' | 'creative';
}

export type WorkspaceSettings = {
    autoSave: boolean;
}

interface SettingsState {
  profile: ProfileSettings;
  setProfile: (profile: ProfileSettings) => void;
  aiSettings: AISettings;
  setAISettings: (settings: AISettings) => void;
  workspaceSettings: WorkspaceSettings;
  setWorkspaceSettings: (settings: WorkspaceSettings) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      profile: {
        fullName: "Teacher",
        schoolName: "",
        subjects: "",
        grades: "",
        photoUrl: "",
        coverUrl: "",
      },
      aiSettings: {
        defaultLanguage: "Hindi",
        defaultGrade: "Grade 8",
        creativityLevel: "balanced",
      },
      workspaceSettings: {
        autoSave: false,
      },
      setProfile: (profile) => set({ profile }),
      setAISettings: (aiSettings) => set({ aiSettings }),
      setWorkspaceSettings: (workspaceSettings) => set({ workspaceSettings }),
    }),
    {
      name: "sahayak-ai-settings-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
