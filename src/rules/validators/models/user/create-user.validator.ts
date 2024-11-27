import { IsDefined, IsEmail, IsIn, IsString, MaxLength, MinLength, validate } from "class-validator";
import { plainToInstance, Transform } from "class-transformer";

import { UserRoles, validRoles } from "../../../../types/user/user-roles.type";
import { UserRequest } from "../../../../types/user/user-request.type";
import { USER_CONSTANTS } from "@root/rules/constants/user.constants";
import { ValidationResult } from "../../types/validation-result.type";
import { validationOptionsConfig } from "../../config/validation.config";
import { toLowerCase } from "../../helpers/to-lowercase.helper";

export class CreateUserValidator implements UserRequest {

    @IsDefined()
    @MinLength(USER_CONSTANTS.MIN_NAME_LENGTH)
    @MaxLength(USER_CONSTANTS.MAX_NAME_LENGTH)
    @Transform(toLowerCase)
    name!: string;

    @IsDefined()
    @IsEmail()
    email!: string;

    @IsDefined()
    @MinLength(USER_CONSTANTS.MIN_PASSWORD_LENGTH)
    @MaxLength(USER_CONSTANTS.MAX_PASSWORD_LENGTH)
    password!: string;

    @IsDefined()
    @IsString()
    @IsIn(validRoles)
    role!: UserRoles;

    static async validateAndTransform(data: object): ValidationResult<CreateUserValidator> {
        const user = new CreateUserValidator();
        Object.assign(user, data);
        const errors = await validate(user, validationOptionsConfig);

        if (errors.length > 0) {            
            return [errors.map(error => ({
                property: error.property,
                constraints: error.constraints,
            })), undefined];
        }

        return [undefined, plainToInstance(CreateUserValidator, user)];
    }
}