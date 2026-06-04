export interface Unit {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  createdAt: Date;
}

export type UnitStatus = 'locked' | 'unlocked' | 'passed';

export interface UnitWithStatus extends Unit {
  status: UnitStatus;
}
