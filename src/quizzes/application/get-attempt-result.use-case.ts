import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuizAttempt } from '../domain/quiz-attempt.entity';
import { Quiz } from '../domain/quiz.entity';
import { AttemptRepository } from '../domain/repositories/attempt.repository';
import { QuestionRepository } from '../domain/repositories/question.repository';
import { QuizRepository } from '../domain/repositories/quiz.repository';

export interface ResultQuestion {
  id: string;
  question: string;
  choices: string[];
  correctChoice: number;
  chosenIndex: number | null;
  isCorrect: boolean;
  grade: number;
}

export interface AttemptResult {
  attempt: QuizAttempt;
  quiz: Quiz;
  questions: ResultQuestion[];
}

@Injectable()
export class GetAttemptResultUseCase {
  constructor(
    private readonly attempts: AttemptRepository,
    private readonly quizzes: QuizRepository,
    private readonly questions: QuestionRepository,
  ) {}

  async execute(userId: string, attemptId: string): Promise<AttemptResult> {
    const attempt = await this.attempts.findById(attemptId);
    if (!attempt) throw new NotFoundException('attempt_not_found');
    if (attempt.userId !== userId)
      throw new ForbiddenException('not_your_attempt');
    if (attempt.status === 'in_progress')
      throw new BadRequestException('attempt_not_finalized');

    const quiz = await this.quizzes.findById(attempt.quizId);
    if (!quiz) throw new NotFoundException('quiz_not_found');

    const [allQuestions, answers] = await Promise.all([
      this.questions.listByQuiz(attempt.quizId),
      this.attempts.listAnswers(attempt.id),
    ]);

    const byId = new Map(answers.map((a) => [a.questionId, a]));
    const resultQuestions: ResultQuestion[] = allQuestions.map((q) => {
      const a = byId.get(q.id);
      const chosenIndex = a?.chosenIndex ?? null;
      return {
        id: q.id,
        question: q.question,
        choices: q.choices,
        correctChoice: q.correctChoice,
        chosenIndex,
        isCorrect: chosenIndex === q.correctChoice,
        grade: q.grade,
      };
    });

    return { attempt, quiz, questions: resultQuestions };
  }
}
