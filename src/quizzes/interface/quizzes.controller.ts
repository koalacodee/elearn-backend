import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../../auth/domain/user.entity';
import { CurrentUser } from '../../auth/interface/decorators/current-user.decorator';
import { GetAttemptResultUseCase } from '../application/get-attempt-result.use-case';
import { ListMyAttemptsUseCase } from '../application/list-my-attempts.use-case';
import { ListQuizzesForUnitUseCase } from '../application/list-quizzes-for-unit.use-case';
import { StartAttemptUseCase } from '../application/start-attempt.use-case';
import { SubmitAttemptUseCase } from '../application/submit-attempt.use-case';
import { SubmitAttemptDto } from './dtos/submit-attempt.dto';

@Controller()
export class QuizzesController {
  constructor(
    private readonly listForUnit: ListQuizzesForUnitUseCase,
    private readonly startAttempt: StartAttemptUseCase,
    private readonly submitAttempt: SubmitAttemptUseCase,
    private readonly getResult: GetAttemptResultUseCase,
    private readonly listMine: ListMyAttemptsUseCase,
  ) {}

  private requireUser(user: User | undefined): User {
    if (!user) throw new UnauthorizedException('not_authenticated');
    return user;
  }

  @Get('units/:unitId/quizzes')
  listForUnitRoute(
    @CurrentUser() user: User | undefined,
    @Param('unitId', ParseUUIDPipe) unitId: string,
  ) {
    const u = this.requireUser(user);
    return this.listForUnit.executeForStudent(u.id, unitId);
  }

  @Post('quizzes/:id/attempts')
  start(
    @CurrentUser() user: User | undefined,
    @Param('id', ParseUUIDPipe) quizId: string,
  ) {
    const u = this.requireUser(user);
    return this.startAttempt.execute(u.id, quizId);
  }

  @Post('quizzes/:quizId/attempts/:attemptId/submit')
  submit(
    @CurrentUser() user: User | undefined,
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body() dto: SubmitAttemptDto,
  ) {
    const u = this.requireUser(user);
    return this.submitAttempt.execute({
      userId: u.id,
      quizId,
      attemptId,
      answers: dto.answers.map((a) => ({
        questionId: a.questionId,
        chosenIndex: a.chosenIndex ?? null,
      })),
    });
  }

  @Get('quizzes/:quizId/attempts/:attemptId/result')
  result(
    @CurrentUser() user: User | undefined,
    @Param('quizId', ParseUUIDPipe) _quizId: string,
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
  ) {
    const u = this.requireUser(user);
    return this.getResult.execute(u.id, attemptId);
  }

  @Get('quizzes/:quizId/attempts')
  listMyAttempts(
    @CurrentUser() user: User | undefined,
    @Param('quizId', ParseUUIDPipe) quizId: string,
  ) {
    const u = this.requireUser(user);
    return this.listMine.execute(u.id, quizId);
  }
}
