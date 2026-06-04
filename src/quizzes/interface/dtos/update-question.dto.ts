import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  question?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  choices?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  correctChoice?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  grade?: number;
}
