import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateQuizDto {
  @IsUUID()
  unitId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsBoolean()
  isMandatory!: boolean;

  @IsInt()
  @Min(1)
  timeLimitSec!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passThresholdPct?: number;
}
