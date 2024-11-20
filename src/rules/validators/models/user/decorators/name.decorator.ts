import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
    isString,
    maxLength,
    minLength
} from 'class-validator';
import {
    generateInvalidStringErrorMessage,
    generateMaxLengthErrorMessage,
    generateMinLengthErrorMessage,
    generateMissingPropertyMessage
} from '@root/rules/validators/messages/generators';
import { USER_VALIDATION_CONSTANTS } from '@root/rules/constants/user.constants';

export function Name(validationOptions?: ValidationOptions & { optional: boolean }) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'user-name',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: string | undefined, args: ValidationArguments) {
                    const maxLengthExpected = USER_VALIDATION_CONSTANTS.MAX_NAME_LENGTH;
                    const minLengthExpected = USER_VALIDATION_CONSTANTS.MIN_NAME_LENGTH;

                    if (value) {
                        if (!isString(value))
                            throw new Error(generateInvalidStringErrorMessage('name'));

                        if (!maxLength(value, maxLengthExpected))
                            throw new Error(generateMaxLengthErrorMessage('name', maxLengthExpected));

                        if (!minLength(value, minLengthExpected))
                            throw new Error(generateMinLengthErrorMessage('name', minLengthExpected));

                        // apply lowercase and trim
                        (args.object as any).name = value.toLowerCase().trim();

                    } else {
                        if (!validationOptions?.optional)
                            throw new Error(generateMissingPropertyMessage('name'));
                    }

                    return true;
                },
            },
        });
    };
}