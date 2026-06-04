import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { UnlockNextUnitUseCase } from '../../units/application/unlock-next-unit.use-case';
import { scoreQuiz } from '../domain/quiz-scorer';
import { QuizAttempt, QuizAttemptStatus } from '../domain/quiz-attempt.entity';
import { AttemptRepository } from '../domain/repositories/attempt.repository';
import { QuestionRepository } from '../domain/repositories/question.repository';
import { QuizRepository } from '../domain/repositories/quiz.repository';

export interface SubmitAnswer {
  questionId: string;
  chosenIndex: number | null;
}

export interface SubmitAttemptInput {
  userId: string;
  quizId: string;
  attemptId: string;
  answers: SubmitAnswer[];
}

@Injectable()
export class SubmitAttemptUseCase {
  private readonly logger = new Logger(SubmitAttemptUseCase.name);

  constructor(
    private readonly quizzes: QuizRepository,
    private readonly questions: QuestionRepository,
    private readonly attempts: AttemptRepository,
    private readonly unlockNext: UnlockNextUnitUseCase,
  ) {}

  async execute(input: SubmitAttemptInput): Promise<QuizAttempt> {
    const attempt = await this.attempts.findById(input.attemptId);
    if (!attempt) throw new NotFoundException('attempt_not_found');
    if (attempt.userId !== input.userId)
      throw new ForbiddenException('not_your_attempt');
    if (attempt.quizId !== input.quizId)
      throw new BadRequestException('attempt_quiz_mismatch');
    if (attempt.status !== 'in_progress')
      throw new BadRequestException('attempt_already_finalized');

    const quiz = await this.quizzes.findById(input.quizId);
    if (!quiz) throw new NotFoundException('quiz_not_found');

    const questions = await this.questions.listByQuiz(input.quizId);
    const validIds = new Set(questions.map((q) => q.id));

    const normalized: SubmitAnswer[] = input.answers
      .filter((a) => validIds.has(a.questionId))
      .map((a) => ({
        questionId: a.questionId,
        chosenIndex:
          typeof a.chosenIndex === 'number' && Number.isInteger(a.chosenIndex)
            ? a.chosenIndex
            : null,
      }));

    const submittedAt = new Date();
    const isExpired = submittedAt.getTime() > attempt.deadlineAt.getTime();
    const effectiveSubmittedAt = isExpired ? attempt.deadlineAt : submittedAt;

    const result = scoreQuiz(
      questions,
      normalized.map((a) => ({
        attemptId: attempt.id,
        questionId: a.questionId,
        chosenIndex: a.chosenIndex,
      })),
    );
    const passed = result.percentage >= quiz.passThresholdPct;
    const status: QuizAttemptStatus = isExpired ? 'expired' : 'submitted';

    const finalized = await this.attempts.finalize({
      id: attempt.id,
      submittedAt: effectiveSubmittedAt,
      scoreEarned: result.earned,
      scoreTotal: result.total,
      percentage: result.percentage,
      passed,
      status,
      answers: normalized,
    });

    if (passed && quiz.isMandatory) {
      void this.unlockNext
        .execute(input.userId, quiz.unitId)
        .catch((err) =>
          this.logger.error('failed to unlock next unit', err as Error),
        );
    }

    return finalized;
  }
}
