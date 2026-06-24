import { create } from 'zustand';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string; // Tailwind color class or hex for confetti
}

interface AchievementState {
  activeAchievement: Achievement | null;
  showAchievement: (achievement: Achievement) => void;
  hideAchievement: () => void;
}

export const useAchievementStore = create<AchievementState>((set) => ({
  activeAchievement: null,
  showAchievement: (achievement) => {
    set({ activeAchievement: achievement });
  },
  hideAchievement: () => set({ activeAchievement: null }),
}));
