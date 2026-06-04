export interface Quiz {
  id: string;
  unitId: string;
  title: string;
  description: string | null;
  isMandatory: boolean;
  timeLimitSec: number;
  passThresholdPct: number;
  createdAt: Date;
}
