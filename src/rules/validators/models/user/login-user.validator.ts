import { IsDefined, IsEmail, IsString, validate } from "class-validator";
import { missingPropertyMssg } from "../../messages/missing-property.message";
import { ValidationResult } from "../../types/validation-result.type";
import { validationOptionsConfig } from "../../config/validation.config";
import { getErrors } from "../../helpers/get-errors.helper";
import { CreateUserValidator } from "./create-user.validator";

export class LoginUserValidator implements Pick<CreateUserValidator, 'email' | 'password'> {

    @IsDefined({ message: missingPropertyMssg('email') })
    @IsEmail()
    email!: string;

    @IsDefined({ message: missingPropertyMssg('password') })
    @IsString()
    password!: string;

    static async validate(body: object): ValidationResult<LoginUserValidator> {
        const user = new LoginUserValidator();
        Object.assign(user, body);
        const errors = await validate(user, validationOptionsConfig);
        if (errors.length > 0) return [getErrors(errors), undefined];
        return [undefined, user];
    }
}