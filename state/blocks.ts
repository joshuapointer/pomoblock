import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import type { Block } from './types';

type BlocksState = {
  blocks: Block[];
  upsert: (block: Block) => void;
  remove: (id: string) => void;
  setEnabled: (id: string, enabled: boolean) => void;
  byId: (id: string) => Block | undefined;
};

export const useBlocks = create<BlocksState>()(
  persist(
    (set, get) => ({
      blocks: [],
      upsert: (block) =>
        set((s) => {
          const i = s.blocks.findIndex((b) => b.id === block.id);
          if (i === -1) return { blocks: [...s.blocks, block] };
          const next = s.blocks.slice();
          next[i] = block;
          return { blocks: next };
        }),
      remove: (id) => set((s) => ({ blocks: s.blocks.filter((b) => b.id !== id) })),
      setEnabled: (id, enabled) =>
        set((s) => ({
          blocks: s.blocks.map((b) => (b.id === id ? { ...b, enabled } : b)),
        })),
      byId: (id) => get().blocks.find((b) => b.id === id),
    }),
    {
      name: 'pomoblock.blocks',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
