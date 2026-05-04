import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';

type AuthStatus = 'approved' | 'denied' | 'notDetermined';

type SettingsState = {
  authStatus: AuthStatus;
  hasOnboarded: boolean;
  defaultPomodoroMinutes: number;
  defaultBreakMinutes: number;
  setAuth: (s: AuthStatus) => void;
  setOnboarded: (v: boolean) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      authStatus: 'notDetermined',
      hasOnboarded: false,
      defaultPomodoroMinutes: 25,
      defaultBreakMinutes: 5,
      setAuth: (authStatus) => set({ authStatus }),
      setOnboarded: (hasOnboarded) => set({ hasOnboarded }),
    }),
    {
      name: 'pomoblock.settings',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
