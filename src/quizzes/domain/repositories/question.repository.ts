import { QuizQuestion } from '../quiz-question.entity';

export interface CreateQuestionInput {
  quizId: string;
  question: string;
  choices: string[];
  correctChoice: number;
  grade: number;
  orderIndex: number;
}

export type UpdateQuestionInput = Partial<Omit<CreateQuestionInput, 'quizId'>>;

export abstract class QuestionRepository {
  abstract create(input: CreateQuestionInput): Promise<QuizQuestion>;
  abstract createMany(inputs: CreateQuestionInput[]): Promise<QuizQuestion[]>;
  abstract update(
    id: string,
    input: UpdateQuestionInput,
  ): Promise<QuizQuestion | null>;
  abstract delete(id: string): Promise<boolean>;
  abstract findById(id: string): Promise<QuizQuestion | null>;
  abstract listByQuiz(quizId: string): Promise<QuizQuestion[]>;
  abstract maxOrderIndex(quizId: string): Promise<number | null>;
}
