import { MMKV } from 'react-native-mmkv';

const mmkv = new MMKV({ id: 'pomoblock' });

export const storage = {
  get<T>(key: string): T | undefined {
    const raw = mmkv.getString(key);
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  },
  set<T>(key: string, value: T): void {
    mmkv.set(key, JSON.stringify(value));
  },
  delete(key: string): void {
    mmkv.delete(key);
  },
  clearAll(): void {
    mmkv.clearAll();
  },
};

// Zustand persist adapter — JSONStorage shape
export const zustandStorage = {
  getItem: (name: string): string | null => mmkv.getString(name) ?? null,
  setItem: (name: string, value: string): void => mmkv.set(name, value),
  removeItem: (name: string): void => mmkv.delete(name),
};
