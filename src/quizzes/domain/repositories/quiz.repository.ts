import { Quiz } from '../quiz.entity';

export interface CreateQuizInput {
  unitId: string;
  title: string;
  description?: string | null;
  isMandatory: boolean;
  timeLimitSec: number;
  passThresholdPct?: number;
}

export type UpdateQuizInput = Partial<Omit<CreateQuizInput, 'unitId'>>;

export abstract class QuizRepository {
  abstract create(input: CreateQuizInput): Promise<Quiz>;
  abstract update(id: string, input: UpdateQuizInput): Promise<Quiz | null>;
  abstract delete(id: string): Promise<boolean>;
  abstract findById(id: string): Promise<Quiz | null>;
  abstract listByUnit(unitId: string): Promise<Quiz[]>;
  abstract findMandatoryForUnit(unitId: string): Promise<Quiz | null>;
}
