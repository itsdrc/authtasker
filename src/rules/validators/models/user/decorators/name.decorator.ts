import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,    
    isString,
    maxLength,
    minLength
} from 'class-validator';
import { missingPropertyMssg } from '../../../messages/missing-property.message';
import { USER_VALIDATION_CONSTANTS } from '../../../../constants/user.constants';
import { maxLengthErrorMessage } from '../../../messages/max-length-error.message';
import { minLengthErrorMessage } from '../../../messages/min-length-error.message';

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
                            throw new Error('name must be an string');

                        if (!maxLength(value, maxLengthExpected))
                            throw new Error(maxLengthErrorMessage('name', maxLengthExpected));

                        if (!minLength(value, minLengthExpected))
                            throw new Error(minLengthErrorMessage('name', minLengthExpected));

                        // apply lowercase and trim
                        (args.object as any).name = value.toLowerCase().trim();

                    } else {
                        if (!validationOptions?.optional)
                            throw new Error(missingPropertyMssg('name'));
                    }

                    return true;
                },
            },
        });
    };
}