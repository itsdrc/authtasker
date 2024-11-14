import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments, isEmail
} from 'class-validator';
import { missingPropertyMssg } from '../../../messages/missing-property.message';

export function Email(validationOptions?: ValidationOptions & { optional: boolean }) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'user-email',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: string | undefined, args: ValidationArguments) {
                    if (value) {
                        if (!isEmail(value))
                            throw new Error('email must be an email');

                    } else {
                        if (!validationOptions?.optional)
                            throw new Error(missingPropertyMssg('email'));
                    }
                    return true;
                },
            },
        });
    };
}