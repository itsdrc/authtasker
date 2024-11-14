import { registerDecorator, ValidationOptions, ValidationArguments, isDefined, isString, maxLength, minLength, isEmail } from 'class-validator';
import { missingPropertyMssg } from '../../../messages/missing-property.message';
import { USER_VALIDATION_CONSTANTS } from '../../../../constants/user.constants';
import { maxLengthErrorMessage } from '../../../messages/max-length-error.message';
import { minLengthErrorMessage } from '../../../messages/min-length-error.message';

export function Email(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'user-email',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: string, args: ValidationArguments) {                    
                    switch (false) {
                        case isDefined(value):
                            throw new Error(missingPropertyMssg('email'));
                        case isEmail(value):
                            throw new Error('email must be an email');
                    }                    
                    return true;
                },
            },
        });
    };
}