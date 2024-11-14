import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
    isDefined,
    isString,
    isIn
} from 'class-validator';
import { missingPropertyMssg } from '../../../messages/missing-property.message';
import { validRoles } from '../../../../../types/user/user-roles.type';

export function Role(validationOptions?: ValidationOptions & { optional: boolean }) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'user-role',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: string, args: ValidationArguments) {
                    if (isDefined(value)) {
                        switch (false) {
                            case isString(value):
                                throw new Error('role must be an string');
                                
                            case isIn(value, validRoles):
                                throw new Error(`role must be one of the following values: ${validRoles.join(', ')}`)
                        }
                    } else {
                        if (!validationOptions?.optional)
                            throw new Error(missingPropertyMssg('role'));
                    }

                    return true;
                },
            },
        });
    };
}