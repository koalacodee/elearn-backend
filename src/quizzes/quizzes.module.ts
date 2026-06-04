import { Module } from '@nestjs/common';
import { UnitsModule } from '../units/units.module';
import { CreateQuestionUseCase } from './application/create-question.use-case';
import { CreateQuizUseCase } from './application/create-quiz.use-case';
import { DeleteQuestionUseCase } from './application/delete-question.use-case';
import { DeleteQuizUseCase } from './application/delete-quiz.use-case';
import { GetAttemptResultUseCase } from './application/get-attempt-result.use-case';
import { ImportQuestionsUseCase } from './application/import-questions.use-case';
import { ListMyAttemptsUseCase } from './application/list-my-attempts.use-case';
import { ListQuizzesForUnitUseCase } from './application/list-quizzes-for-unit.use-case';
import { StartAttemptUseCase } from './application/start-attempt.use-case';
import { SubmitAttemptUseCase } from './application/submit-attempt.use-case';
import { UpdateQuestionUseCase } from './application/update-question.use-case';
import { UpdateQuizUseCase } from './application/update-quiz.use-case';
import { AttemptRepository } from './domain/repositories/attempt.repository';
import { QuestionRepository } from './domain/repositories/question.repository';
import { QuizRepository } from './domain/repositories/quiz.repository';
import { DrizzleAttemptRepository } from './infrastructure/drizzle-attempt.repository';
import { DrizzleQuestionRepository } from './infrastructure/drizzle-question.repository';
import { DrizzleQuizRepository } from './infrastructure/drizzle-quiz.repository';
import { AdminQuizzesController } from './interface/admin-quizzes.controller';
import { QuizzesController } from './interface/quizzes.controller';

@Module({
  imports: [UnitsModule],
  controllers: [QuizzesController, AdminQuizzesController],
  providers: [
    CreateQuizUseCase,
    UpdateQuizUseCase,
    DeleteQuizUseCase,
    ListQuizzesForUnitUseCase,
    CreateQuestionUseCase,
    UpdateQuestionUseCase,
    DeleteQuestionUseCase,
    ImportQuestionsUseCase,
    StartAttemptUseCase,
    SubmitAttemptUseCase,
    GetAttemptResultUseCase,
    ListMyAttemptsUseCase,
    { provide: QuizRepository, useClass: DrizzleQuizRepository },
    { provide: QuestionRepository, useClass: DrizzleQuestionRepository },
    { provide: AttemptRepository, useClass: DrizzleAttemptRepository },
  ],
})
export class QuizzesModule {}
