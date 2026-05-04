// Single seam between the rest of the app and Apple Family Controls.
// Backed by react-native-device-activity (Kingstinct) on device; mocked in dev so
// the JS-only flow is iterable in the simulator and on Linux. Every other file
// imports from here — never from the underlying RN module directly.

import { Platform } from 'react-native';
import type { ShieldStyle, SelectionToken } from '@/state/types';

export type AuthStatus = 'approved' | 'denied' | 'notDetermined';

export type StartBlockOpts = {
  id: string;
  selection: SelectionToken;
  durationMinutes: number;
  shieldStyle: ShieldStyle;
};

export type ShieldActionEvent = {
  blockId: string;
  action: 'wait' | 'budget5' | 'end';
};

export type Unsubscribe = () => void;

export type ScreenTimeBridge = {
  isReal: boolean;
  requestAuthorization: () => Promise<AuthStatus>;
  presentFamilyActivityPicker: (initial?: SelectionToken) => Promise<SelectionToken>;
  startBlock: (opts: StartBlockOpts) => Promise<void>;
  endActiveBlock: (id: string) => Promise<void>;
  onShieldAction: (handler: (e: ShieldActionEvent) => void) => Unsubscribe;
};

// ---------------------------------------------------------------------------
// Mock — used on Android, web, simulator, and any non-iOS surface so the UI
// flow exercises end-to-end without the real entitlement.
// ---------------------------------------------------------------------------

const mockListeners = new Set<(e: ShieldActionEvent) => void>();

const mockBridge: ScreenTimeBridge = {
  isReal: false,
  requestAuthorization: async () => {
    if (__DEV__) console.log('[screen-time mock] requestAuthorization');
    return 'approved';
  },
  presentFamilyActivityPicker: async (initial) => {
    if (__DEV__) console.log('[screen-time mock] presentFamilyActivityPicker', initial);
    // Opaque blob — JS never inspects this.
    return initial ?? `mock-selection-${Date.now()}`;
  },
  startBlock: async (opts) => {
    if (__DEV__) console.log('[screen-time mock] startBlock', opts);
  },
  endActiveBlock: async (id) => {
    if (__DEV__) console.log('[screen-time mock] endActiveBlock', id);
  },
  onShieldAction: (handler) => {
    mockListeners.add(handler);
    return () => {
      mockListeners.delete(handler);
    };
  },
};

// Test hook: simulate a shield tap from the in-app preview.
export function __mockEmitShieldAction(e: ShieldActionEvent): void {
  for (const l of mockListeners) l(e);
}

// ---------------------------------------------------------------------------
// Real iOS bridge — lazy required so Linux/Android imports never crash.
// ---------------------------------------------------------------------------

function loadRealBridge(): ScreenTimeBridge | null {
  if (Platform.OS !== 'ios') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const lib = require('react-native-device-activity');
    return wrapKingstinct(lib);
  } catch (err) {
    if (__DEV__) console.warn('[screen-time] real bridge unavailable, falling back to mock', err);
    return null;
  }
}

type KingstinctModule = {
  requestAuthorization: (opts?: unknown) => Promise<unknown>;
  getAuthorizationStatus?: () => Promise<unknown>;
  startMonitoring: (name: string, schedule: unknown, events?: unknown) => Promise<unknown>;
  stopMonitoring: (names?: string[]) => Promise<unknown>;
  blockSelection?: (opts: unknown) => Promise<unknown>;
  unblockSelection?: (opts: unknown) => Promise<unknown>;
  reloadDeviceActivityCenter?: () => Promise<unknown>;
  presentFamilyActivityPicker?: (opts?: unknown) => Promise<unknown>;
  selectFamilyActivity?: (opts?: unknown) => Promise<unknown>;
  addEventReceiver?: (eventName: string, handler: (event: unknown) => void) => { remove: () => void };
  userDefaultsSet?: (key: string, value: unknown) => void;
};

function wrapKingstinct(lib: KingstinctModule): ScreenTimeBridge {
  return {
    isReal: true,
    requestAuthorization: async () => {
      const result = await lib.requestAuthorization({ memberType: 'individual' });
      return normalizeAuth(result);
    },
    presentFamilyActivityPicker: async (initial) => {
      const picker = lib.presentFamilyActivityPicker ?? lib.selectFamilyActivity;
      if (!picker) throw new Error('FamilyActivityPicker unavailable');
      const result = (await picker({ initialSelection: initial, headerText: 'Apps to cover' })) as unknown;
      // Wrapper returns an object; we serialize to an opaque token. Storing the
      // raw shape on the JS side is fine — it's only re-passed back through
      // this bridge, never inspected.
      return JSON.stringify(result ?? null);
    },
    startBlock: async ({ id, selection, durationMinutes, shieldStyle }) => {
      const parsed = safeParse(selection);
      // Persist the selection + style into App Group user defaults so the
      // ShieldConfiguration extension can render the right take.
      lib.userDefaultsSet?.(`pomoblock.block.${id}.style`, shieldStyle);
      lib.userDefaultsSet?.(`pomoblock.block.${id}.startedAt`, Date.now());
      if (lib.blockSelection) {
        await lib.blockSelection({ id, selection: parsed });
      }
      // Schedule a DeviceActivity interval so the extension fires when the
      // pomodoro elapses — used to flip into break / end the block.
      const now = new Date();
      const end = new Date(now.getTime() + durationMinutes * 60 * 1000);
      await lib.startMonitoring(
        `pomoblock.block.${id}`,
        {
          intervalStart: { hour: now.getHours(), minute: now.getMinutes() },
          intervalEnd: { hour: end.getHours(), minute: end.getMinutes() },
          repeats: false,
        },
        undefined,
      );
    },
    endActiveBlock: async (id) => {
      if (lib.unblockSelection) {
        await lib.unblockSelection({ id });
      }
      await lib.stopMonitoring([`pomoblock.block.${id}`]);
    },
    onShieldAction: (handler) => {
      const sub = lib.addEventReceiver?.('shieldAction', (raw) => {
        const e = raw as { blockId?: string; action?: string };
        if (!e.blockId || !e.action) return;
        if (e.action === 'wait' || e.action === 'budget5' || e.action === 'end') {
          handler({ blockId: e.blockId, action: e.action });
        }
      });
      return () => sub?.remove();
    },
  };
}

function normalizeAuth(raw: unknown): AuthStatus {
  if (typeof raw === 'string') {
    if (raw === 'approved' || raw === 'denied' || raw === 'notDetermined') return raw;
  }
  if (typeof raw === 'number') {
    // ManagedSettings.AuthorizationStatus enum
    if (raw === 1) return 'denied';
    if (raw === 2) return 'approved';
    return 'notDetermined';
  }
  return 'notDetermined';
}

function safeParse<T = unknown>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

const real = loadRealBridge();

export const screenTime: ScreenTimeBridge = real ?? mockBridge;
