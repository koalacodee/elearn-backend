import { registerDecorator, ValidationOptions } from 'class-validator';
import { isEgyptianPhone } from '../../domain/phone';

export function IsEgyptianPhone(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEgyptianPhone',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown) {
          return isEgyptianPhone(value);
        },
        defaultMessage() {
          return 'phone must be a valid Egyptian mobile number';
        },
      },
    });
  };
}
