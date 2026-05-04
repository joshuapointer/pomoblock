// Opaque token returned from FamilyActivityPicker. Never read on JS side.
export type SelectionToken = string;

export type ShieldStyle = 'pomodoro' | 'friction';

export type Schedule = {
  daysOfWeek: Array<0 | 1 | 2 | 3 | 4 | 5 | 6>; // 0 = Sun
  startMinute: number; // minutes since midnight
  endMinute: number;
};

export type Block = {
  id: string;
  name: string;
  selection: SelectionToken;
  selectionLabel: string; // e.g. "19 items covered"
  durationMinutes: number; // pomodoro length, default 25
  shieldStyle: ShieldStyle;
  schedule: Schedule | null;
  enabled: boolean;
  createdAt: number;
};

export type ActiveSession = {
  blockId: string;
  startedAt: number; // epoch ms
  pomodoroIndex: number; // 0-based within today
  state: 'pomodoro' | 'break' | 'idle';
};
