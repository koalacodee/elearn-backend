import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { UserRole } from '../../auth/domain/user-role.enum';
import { Role } from '../../auth/interface/decorators/role.decorator';
import { CreateQuestionUseCase } from '../application/create-question.use-case';
import { CreateQuizUseCase } from '../application/create-quiz.use-case';
import { DeleteQuestionUseCase } from '../application/delete-question.use-case';
import { DeleteQuizUseCase } from '../application/delete-quiz.use-case';
import { ImportQuestionsUseCase } from '../application/import-questions.use-case';
import { ListQuizzesForUnitUseCase } from '../application/list-quizzes-for-unit.use-case';
import { UpdateQuestionUseCase } from '../application/update-question.use-case';
import { UpdateQuizUseCase } from '../application/update-quiz.use-case';
import { QuestionRepository } from '../domain/repositories/question.repository';
import { QuizRepository } from '../domain/repositories/quiz.repository';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { CreateQuizDto } from './dtos/create-quiz.dto';
import { UpdateQuestionDto } from './dtos/update-question.dto';
import { UpdateQuizDto } from './dtos/update-quiz.dto';

@Role([UserRole.ADMIN])
@Controller()
export class AdminQuizzesController {
  constructor(
    private readonly createQuiz: CreateQuizUseCase,
    private readonly updateQuiz: UpdateQuizUseCase,
    private readonly deleteQuiz: DeleteQuizUseCase,
    private readonly listQuizzes: ListQuizzesForUnitUseCase,
    private readonly createQuestion: CreateQuestionUseCase,
    private readonly updateQuestion: UpdateQuestionUseCase,
    private readonly deleteQuestion: DeleteQuestionUseCase,
    private readonly importQuestions: ImportQuestionsUseCase,
    private readonly quizzes: QuizRepository,
    private readonly questions: QuestionRepository,
  ) {}

  @Get('admin/units/:unitId/quizzes')
  listForUnit(@Param('unitId', ParseUUIDPipe) unitId: string) {
    return this.listQuizzes.executeForAdmin(unitId);
  }

  @Get('admin/quizzes/:id')
  async getQuiz(@Param('id', ParseUUIDPipe) id: string) {
    const quiz = await this.quizzes.findById(id);
    if (!quiz) throw new BadRequestException('quiz_not_found');
    return quiz;
  }

  @Post('admin/quizzes')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateQuizDto) {
    return this.createQuiz.execute({
      unitId: dto.unitId,
      title: dto.title,
      description: dto.description ?? null,
      isMandatory: dto.isMandatory,
      timeLimitSec: dto.timeLimitSec,
      passThresholdPct: dto.passThresholdPct,
    });
  }

  @Patch('admin/quizzes/:id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateQuizDto) {
    return this.updateQuiz.execute(id, dto);
  }

  @Delete('admin/quizzes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteQuiz.execute(id);
  }

  @Get('admin/quizzes/:quizId/questions')
  listQuestions(@Param('quizId', ParseUUIDPipe) quizId: string) {
    return this.questions.listByQuiz(quizId);
  }

  @Post('admin/quizzes/:quizId/questions')
  @HttpCode(HttpStatus.CREATED)
  addQuestion(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.createQuestion.execute({
      quizId,
      question: dto.question,
      choices: dto.choices,
      correctChoice: dto.correctChoice,
      grade: dto.grade,
    });
  }

  @Patch('admin/questions/:id')
  patchQuestion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.updateQuestion.execute(id, dto);
  }

  @Delete('admin/questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeQuestion(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteQuestion.execute(id);
  }

  @Post('admin/quizzes/:quizId/questions/import')
  @HttpCode(HttpStatus.CREATED)
  async import(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Req() req: FastifyRequest,
  ) {
    const body = await this.readBody(req);
    const inserted = await this.importQuestions.execute({ quizId, body });
    return { imported: inserted.length, questions: inserted };
  }

  private async readBody(req: FastifyRequest): Promise<string> {
    if (req.isMultipart()) {
      const file = await req.file();
      if (!file) throw new BadRequestException('missing_file');
      const buf = await file.toBuffer();
      return buf.toString('utf8');
    }
    if (!req.body) throw new BadRequestException('missing_body');
    return typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }
}
