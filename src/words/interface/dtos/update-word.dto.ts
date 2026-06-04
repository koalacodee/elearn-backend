import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateWordDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  word?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  arabicTranslation?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  sentence?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  arabicSentence?: string;
}
