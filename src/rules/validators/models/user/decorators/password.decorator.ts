import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
    isString, maxLength,
    minLength
} from 'class-validator';
import {
    generateGenericError,
    generateInvalidStringErrorMessage,
    generateMaxLengthErrorMessage,
    generateMinLengthErrorMessage,
    generateMissingPropertyMessage
} from '@root/rules/validators/messages/generators';
import { USER_VALIDATION_CONSTANTS } from '@root/rules/constants/user.constants';
import { CustomOptions } from './interfaces/custom-options.interface';

export function Password(validationOptions?: ValidationOptions & CustomOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'user-password',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: string | undefined, args: ValidationArguments) {
                    const maxLengthExpected = USER_VALIDATION_CONSTANTS.MAX_PASSWORD_LENGTH;
                    const minLengthExpected = USER_VALIDATION_CONSTANTS.MIN_PASSWORD_LENGTH;

                    if (value) {
                        try {
                            if (!isString(value))
                                throw new Error(generateInvalidStringErrorMessage('password'));

                            if (!maxLength(value, maxLengthExpected))
                                throw new Error(generateMaxLengthErrorMessage('password', maxLengthExpected));

                            if (!minLength(value, minLengthExpected))
                                throw new Error(generateMinLengthErrorMessage('password', minLengthExpected));
                        } catch (error) {
                            if (validationOptions?.hideErrors)
                                throw new Error(generateGenericError('password'));
                            else
                                throw error;
                        }

                    } else {
                        if (!validationOptions?.optional)
                            throw new Error(generateMissingPropertyMessage('password'));
                    }

                    return true;
                },
            },
        });
    };
}