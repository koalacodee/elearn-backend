import {
  QuizAttempt,
  QuizAttemptAnswer,
  QuizAttemptStatus,
} from '../quiz-attempt.entity';

export interface CreateAttemptInput {
  quizId: string;
  userId: string;
  startedAt: Date;
  deadlineAt: Date;
}

export interface FinalizeAttemptInput {
  id: string;
  submittedAt: Date;
  scoreEarned: number;
  scoreTotal: number;
  percentage: number;
  passed: boolean;
  status: QuizAttemptStatus;
  answers: { questionId: string; chosenIndex: number | null }[];
}

export abstract class AttemptRepository {
  abstract create(input: CreateAttemptInput): Promise<QuizAttempt>;
  abstract findById(id: string): Promise<QuizAttempt | null>;
  abstract findOpenForUser(
    userId: string,
    quizId: string,
  ): Promise<QuizAttempt | null>;
  abstract listForUserAndQuiz(
    userId: string,
    quizId: string,
  ): Promise<QuizAttempt[]>;
  abstract findBestForUserAndQuiz(
    userId: string,
    quizId: string,
  ): Promise<QuizAttempt | null>;
  abstract finalize(input: FinalizeAttemptInput): Promise<QuizAttempt>;
  abstract listAnswers(attemptId: string): Promise<QuizAttemptAnswer[]>;
}
