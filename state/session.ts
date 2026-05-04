import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import type { ActiveSession } from './types';

type SessionState = {
  active: ActiveSession | null;
  pomodorosToday: number;
  todayKey: string; // YYYY-MM-DD — resets count at day boundary
  start: (blockId: string) => void;
  end: () => void;
  beginBreak: () => void;
  endBreak: () => void;
  bumpPomodoro: () => void;
  resetTodayIfStale: () => void;
};

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      active: null,
      pomodorosToday: 0,
      todayKey: todayKey(),
      start: (blockId) => {
        get().resetTodayIfStale();
        set({
          active: {
            blockId,
            startedAt: Date.now(),
            pomodoroIndex: get().pomodorosToday,
            state: 'pomodoro',
          },
        });
      },
      end: () => set({ active: null }),
      beginBreak: () =>
        set((s) => (s.active ? { active: { ...s.active, state: 'break' } } : s)),
      endBreak: () =>
        set((s) => (s.active ? { active: { ...s.active, state: 'pomodoro' } } : s)),
      bumpPomodoro: () =>
        set((s) => ({ pomodorosToday: s.pomodorosToday + 1 })),
      resetTodayIfStale: () => {
        const tk = todayKey();
        if (get().todayKey !== tk) {
          set({ todayKey: tk, pomodorosToday: 0 });
        }
      },
    }),
    {
      name: 'pomoblock.session',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
