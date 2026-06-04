export interface UserUnitProgress {
  userId: string;
  unitId: string;
  unlockedAt: Date;
  passedAt: Date | null;
}
