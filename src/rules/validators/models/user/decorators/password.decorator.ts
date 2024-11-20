import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
    isString, maxLength,
    minLength
} from 'class-validator';
import {
    generateInvalidStringErrorMessage,
    generateMaxLengthErrorMessage,
    generateMinLengthErrorMessage,
    generateMissingPropertyMessage
} from 'src/rules/validators/messages/generators';
import { USER_VALIDATION_CONSTANTS } from '../../../../constants/user.constants';


export function Password(validationOptions?: ValidationOptions & { optional: boolean }) {
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
                        if (!isString(value))
                            throw new Error(generateInvalidStringErrorMessage('password'));

                        if (!maxLength(value, maxLengthExpected))
                            throw new Error(generateMaxLengthErrorMessage('password', maxLengthExpected));

                        if (!minLength(value, minLengthExpected))
                            throw new Error(generateMinLengthErrorMessage('password', minLengthExpected));

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