export type QuizAttemptStatus = 'in_progress' | 'submitted' | 'expired';

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startedAt: Date;
  deadlineAt: Date;
  submittedAt: Date | null;
  scoreEarned: number | null;
  scoreTotal: number | null;
  percentage: number | null;
  passed: boolean | null;
  status: QuizAttemptStatus;
}

export interface QuizAttemptAnswer {
  attemptId: string;
  questionId: string;
  chosenIndex: number | null;
}
