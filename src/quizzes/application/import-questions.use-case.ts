import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuizQuestion } from '../domain/quiz-question.entity';
import { QuestionRepository } from '../domain/repositories/question.repository';
import { QuizRepository } from '../domain/repositories/quiz.repository';
import { validateQuestionShape } from './create-question.use-case';

interface RawQuestion {
  question?: unknown;
  choices?: unknown;
  correctChoice?: unknown;
  gradesForTheQuestion?: unknown;
}

export interface ImportQuestionsInput {
  quizId: string;
  body: string;
}

@Injectable()
export class ImportQuestionsUseCase {
  constructor(
    private readonly questions: QuestionRepository,
    private readonly quizzes: QuizRepository,
  ) {}

  async execute(input: ImportQuestionsInput): Promise<QuizQuestion[]> {
    const quiz = await this.quizzes.findById(input.quizId);
    if (!quiz) throw new NotFoundException('quiz_not_found');

    let parsed: unknown;
    try {
      parsed = JSON.parse(input.body);
    } catch (e) {
      throw new BadRequestException(
        `json_parse_error: ${(e as Error).message}`,
      );
    }
    if (!Array.isArray(parsed)) {
      throw new BadRequestException('json_must_be_array');
    }
    if (parsed.length === 0) throw new BadRequestException('no_rows_to_import');

    const startOrder =
      ((await this.questions.maxOrderIndex(input.quizId)) ?? -1) + 1;

    const rows = (parsed as RawQuestion[]).map((r, idx) => {
      if (typeof r.question !== 'string' || r.question.length === 0) {
        throw new BadRequestException(
          `row ${idx + 1}: question must be a non-empty string`,
        );
      }
      if (
        !Array.isArray(r.choices) ||
        r.choices.some((c) => typeof c !== 'string')
      ) {
        throw new BadRequestException(
          `row ${idx + 1}: choices must be string array`,
        );
      }
      const choices = r.choices as string[];
      const correctChoice = Number(r.correctChoice);
      const grade =
        r.gradesForTheQuestion === undefined
          ? 1
          : Number(r.gradesForTheQuestion);
      try {
        validateQuestionShape({ choices, correctChoice, grade });
      } catch (e) {
        throw new BadRequestException(
          `row ${idx + 1}: ${(e as Error).message}`,
        );
      }
      return {
        quizId: input.quizId,
        question: r.question,
        choices,
        correctChoice,
        grade,
        orderIndex: startOrder + idx,
      };
    });

    return this.questions.createMany(rows);
  }
}
