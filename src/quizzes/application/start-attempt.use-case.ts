import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IsUnitUnlockedUseCase } from '../../units/application/is-unit-unlocked.use-case';
import { QuizQuestion } from '../domain/quiz-question.entity';
import { QuizAttempt } from '../domain/quiz-attempt.entity';
import { Quiz } from '../domain/quiz.entity';
import { AttemptRepository } from '../domain/repositories/attempt.repository';
import { QuestionRepository } from '../domain/repositories/question.repository';
import { QuizRepository } from '../domain/repositories/quiz.repository';

export interface PublicQuestion {
  id: string;
  question: string;
  choices: string[];
  grade: number;
  orderIndex: number;
}

export interface StartAttemptResult {
  attempt: QuizAttempt;
  quiz: Quiz;
  questions: PublicQuestion[];
}

@Injectable()
export class StartAttemptUseCase {
  constructor(
    private readonly quizzes: QuizRepository,
    private readonly questions: QuestionRepository,
    private readonly attempts: AttemptRepository,
    private readonly isUnlocked: IsUnitUnlockedUseCase,
  ) {}

  async execute(userId: string, quizId: string): Promise<StartAttemptResult> {
    const quiz = await this.quizzes.findById(quizId);
    if (!quiz) throw new NotFoundException('quiz_not_found');

    const allowed = await this.isUnlocked.execute(userId, quiz.unitId);
    if (!allowed) throw new ForbiddenException('unit_locked');

    const questions = await this.questions.listByQuiz(quizId);
    if (questions.length === 0) {
      throw new BadRequestException('quiz_has_no_questions');
    }

    const open = await this.attempts.findOpenForUser(userId, quizId);
    if (open && open.deadlineAt.getTime() > Date.now()) {
      return {
        attempt: open,
        quiz,
        questions: questions.map((q) => this.publicQuestion(q)),
      };
    }

    const startedAt = new Date();
    const deadlineAt = new Date(startedAt.getTime() + quiz.timeLimitSec * 1000);
    const attempt = await this.attempts.create({
      quizId,
      userId,
      startedAt,
      deadlineAt,
    });

    return {
      attempt,
      quiz,
      questions: questions.map((q) => this.publicQuestion(q)),
    };
  }

  private publicQuestion(q: QuizQuestion): PublicQuestion {
    return {
      id: q.id,
      question: q.question,
      choices: q.choices,
      grade: q.grade,
      orderIndex: q.orderIndex,
    };
  }
}
