import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';
import { normalizeEgyptianPhone } from '../../domain/phone';
import { IsEgyptianPhone } from '../validators/is-egyptian-phone.validator';

export class LoginDto {
  @Transform(({ value }): string => {
    const normalized = normalizeEgyptianPhone(value);
    return normalized ?? (typeof value === 'string' ? value : '');
  })
  @IsEgyptianPhone()
  phone!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
