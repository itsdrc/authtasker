import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
    isDefined,
    isEmail
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
                validate(value: string, args: ValidationArguments) {
                    if (isDefined(value)) {
                        switch (false) {
                            case isEmail(value):
                                throw new Error('email must be an email');
                        }
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