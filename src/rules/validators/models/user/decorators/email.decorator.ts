import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments, isEmail
} from 'class-validator';
import { INVALID_EMAIL_MESSAGE } from '@root/rules/validators/messages/constants/invalid-email.message.constant';
import { generateGenericError, generateMissingPropertyMessage } from '@root/rules/validators/messages/generators';
import { CustomOptions } from './interfaces/custom-options.interface';

export function Email(validationOptions?: ValidationOptions & CustomOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'user-email',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: string | undefined, args: ValidationArguments) {
                    if (value) {
                        if (!isEmail(value)) {
                            if (validationOptions?.hideErrors)
                                throw new Error(generateGenericError('email'))
                            else
                                throw new Error(INVALID_EMAIL_MESSAGE);
                        }

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