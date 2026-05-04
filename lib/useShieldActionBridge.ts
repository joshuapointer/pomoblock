import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { screenTime } from '@/native/screen-time';
import { useSession } from '@/state/session';

// Listens for ShieldAction taps from the SwiftUI shield extensions and applies
// the right side-effect on the JS side: end the active block, flip into a 5-min
// budget window, or just dismiss (wait).
export function useShieldActionBridge() {
  const end = useSession((s) => s.end);

  useEffect(() => {
    const unsub = screenTime.onShieldAction((e) => {
      switch (e.action) {
        case 'wait':
          // Soft tap — stay in the block, just resume.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          break;
        case 'budget5':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          // 5-minute budget window — handled by the extension; nothing to do
          // on the JS side beyond the haptic confirmation.
          break;
        case 'end':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          end();
          screenTime.endActiveBlock(e.blockId).catch(() => {});
          break;
      }
    });
    return () => unsub();
  }, [end]);
}
