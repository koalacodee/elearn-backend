import { Transform } from 'class-transformer';
import { IsString, MinLength, MaxLength } from 'class-validator';
import { normalizeEgyptianPhone } from '../../domain/phone';
import { IsEgyptianPhone } from '../validators/is-egyptian-phone.validator';

export class RegisterDto {
  @Transform(({ value }): string => {
    const normalized = normalizeEgyptianPhone(value);
    return normalized ?? (typeof value === 'string' ? value : '');
  })
  @IsEgyptianPhone()
  phone!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;
}
