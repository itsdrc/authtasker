import { IsDefined, IsEmail, IsString, validate } from "class-validator";
import { ValidationResult } from "./types/validation-result.type";
import { getErrors } from "./helpers/get-errors.helper";
import { validationOptionsConfig } from "./config/validation.config";

export class LoginUserValidator {

    @IsDefined({message: 'email is required'})
    @IsEmail()
    email!: string;

    @IsDefined({message: 'password is required'})
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