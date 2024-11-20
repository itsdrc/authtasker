import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
    isString,
    isIn
} from 'class-validator';
import {
    generateInvalidStringErrorMessage,
    generateMissingPropertyMessage
} from 'src/rules/validators/messages/generators';
import { validRoles } from '../../../../../types/user/user-roles.type';
import { INVALID_ROLE_MESSAGE } from 'src/rules/validators/messages/constants/invalid-role.message.constant';

export function Role(validationOptions?: ValidationOptions & { optional: boolean }) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'user-role',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: string | undefined, args: ValidationArguments) {
                    if (value) {
                        if (!isString(value))
                            throw new Error(generateInvalidStringErrorMessage('role'));

                        if (!isIn(value, validRoles))
                            throw new Error(INVALID_ROLE_MESSAGE)

                    } else {
                        if (!validationOptions?.optional)
                            throw new Error(generateMissingPropertyMessage('role'));
                    }

                    return true;
                },
            },
        });
    };
}