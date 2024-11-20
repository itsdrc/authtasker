import { IsDefined, IsEmail, IsString, validate } from "class-validator";
import { ValidationResult } from "../../types/validation-result.type";
import { validationOptionsConfig } from "../../config/validation.config";
import { getError } from "../../helpers/get-error.helper";
import { CreateUserValidator } from "./create-user.validator";
import { generateMissingPropertyMessage } from "../../messages/generators";

export class LoginUserValidator implements Pick<CreateUserValidator, 'email' | 'password'> {

    @IsDefined({ message: generateMissingPropertyMessage('email') })
    @IsEmail()
    email!: string;

    @IsDefined({ message: generateMissingPropertyMessage('password') })
    @IsString()
    password!: string;

    static async validate(body: object): ValidationResult<LoginUserValidator> {
        const user = new LoginUserValidator();
        Object.assign(user, body);
        const errors = await validate(user, validationOptionsConfig);
        if (errors.length > 0) return [getError(errors), undefined];
        return [undefined, user];
    }
}