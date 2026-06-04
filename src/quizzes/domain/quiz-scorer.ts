import { QuizAttemptAnswer } from './quiz-attempt.entity';
import { QuizQuestion } from './quiz-question.entity';

export interface ScoringResult {
  earned: number;
  total: number;
  percentage: number;
}

export function scoreQuiz(
  questions: QuizQuestion[],
  answers: QuizAttemptAnswer[],
): ScoringResult {
  const byId = new Map(answers.map((a) => [a.questionId, a]));
  let earned = 0;
  let total = 0;
  for (const q of questions) {
    total += q.grade;
    const a = byId.get(q.id);
    if (a && a.chosenIndex === q.correctChoice) {
      earned += q.grade;
    }
  }
  const percentage = total === 0 ? 0 : Math.round((earned / total) * 100);
  return { earned, total, percentage };
}
