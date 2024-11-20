import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments, isEmail
} from 'class-validator';
import { generateMissingPropertyMessage } from 'src/rules/validators/messages/generators';

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
                            throw new Error(INVALID_EMAIL_MESSAGE);

                    } else {
                        if (!validationOptions?.optional)
                            throw new Error(generateMissingPropertyMessage('email'));
                    }
                    return true;
                },
            },
        });
    };
}