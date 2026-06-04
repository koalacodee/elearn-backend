import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @MinLength(1)
  question!: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  choices!: string[];

  @IsInt()
  @Min(0)
  correctChoice!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  grade?: number;
}
