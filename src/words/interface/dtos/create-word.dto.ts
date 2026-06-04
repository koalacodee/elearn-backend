import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateWordDto {
  @IsUUID()
  unitId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  word!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  arabicTranslation!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  sentence!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  arabicSentence!: string;
}
