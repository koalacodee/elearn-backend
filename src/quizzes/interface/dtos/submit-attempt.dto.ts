import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class SubmitAnswerDto {
  @IsUUID()
  questionId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  chosenIndex?: number | null;
}

export class SubmitAttemptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers!: SubmitAnswerDto[];
}
