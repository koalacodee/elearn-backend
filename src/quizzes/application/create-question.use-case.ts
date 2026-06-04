import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuizQuestion } from '../domain/quiz-question.entity';
import { QuestionRepository } from '../domain/repositories/question.repository';
import { QuizRepository } from '../domain/repositories/quiz.repository';

export interface CreateQuestionInput {
  quizId: string;
  question: string;
  choices: string[];
  correctChoice: number;
  grade?: number;
  orderIndex?: number;
}

export function validateQuestionShape(input: {
  choices: string[];
  correctChoice: number;
  grade?: number;
}): void {
  if (!Array.isArray(input.choices) || input.choices.length < 2) {
    throw new BadRequestException('choices_must_have_at_least_two');
  }
  if (
    !Number.isInteger(input.correctChoice) ||
    input.correctChoice < 0 ||
    input.correctChoice >= input.choices.length
  ) {
    throw new BadRequestException('correct_choice_out_of_range');
  }
  if (
    input.grade !== undefined &&
    (!Number.isInteger(input.grade) || input.grade <= 0)
  ) {
    throw new BadRequestException('grade_must_be_positive_integer');
  }
}

@Injectable()
export class CreateQuestionUseCase {
  constructor(
    private readonly questions: QuestionRepository,
    private readonly quizzes: QuizRepository,
  ) {}

  async execute(input: CreateQuestionInput): Promise<QuizQuestion> {
    validateQuestionShape(input);
    const quiz = await this.quizzes.findById(input.quizId);
    if (!quiz) throw new NotFoundException('quiz_not_found');
    const orderIndex =
      input.orderIndex ??
      ((await this.questions.maxOrderIndex(input.quizId)) ?? -1) + 1;
    return this.questions.create({
      quizId: input.quizId,
      question: input.question,
      choices: input.choices,
      correctChoice: input.correctChoice,
      grade: input.grade ?? 1,
      orderIndex,
    });
  }
}
