import { IsDefined, IsEmail, MaxLength, MinLength, validate } from "class-validator";
import { plainToInstance, Transform } from "class-transformer";

import { Exact } from "@root/types/shared/exact.type";
import { toLowerCase } from "../../helpers/to-lowercase.helper";
import { USER_CONSTANTS } from "@root/rules/constants/user.constants";
import { UserRequest } from "../../../../types/user/user-request.type";
import { validationOptionsConfig } from "../../config/validation.config";
import { ValidationResult } from "../../types/validation-result.type";
import { returnFirstError } from "../../helpers/return-first-error.helper";

export class CreateUserValidator implements Exact<CreateUserValidator, UserRequest> {

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

    static async validateAndTransform(data: object): ValidationResult<CreateUserValidator> {
        const user = new CreateUserValidator();
        Object.assign(user, data); // TODO: what if...

        const errors = await validate(user, validationOptionsConfig);        

        if (errors.length > 0) 
            return [returnFirstError(errors), undefined];

        return [undefined, plainToInstance(CreateUserValidator, user)];
    }
}