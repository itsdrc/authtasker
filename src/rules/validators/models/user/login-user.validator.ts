import { validateOrReject } from "class-validator";
import { ValidationResult } from "../../types/validation-result.type";
import { validationOptionsConfig } from "../../config/validation.config";
import { getError } from "../../helpers/get-error.helper";
import { CreateUserValidator } from "./create-user.validator";
import { Email } from "./decorators/email.decorator";
import { Password } from "./decorators/password.decorator";

// WARNING
// This class is good avoiding the password comparison when the incoming password
// does not meet the system requirements (max and min length). However, if you change
// the password validation constants in a production env (with users already in db), this class
// might mark correct passwords as invalid due the new configuration.

export class LoginUserValidator implements Pick<CreateUserValidator, 'email' | 'password'> {

    @Email({ hideErrors: true })
    email!: string;

    @Password({ hideErrors: true })
    password!: string;

    static async validate(body: object): ValidationResult<LoginUserValidator> {
        const user = new LoginUserValidator();
        Object.assign(user, body);
        try {
            await validateOrReject(user, validationOptionsConfig);
            return [undefined, user];
        } catch (error) {
            // custom decorator throws an error when property is invalid or missing
            // so we always get a single error. On the other hand, when an error is generated
            // by class-validator (for example, when the object contains extra properties) getError
            // function is needed.
            const errorMessage = Array.isArray(error) ? getError(error) : (error as Error).message;
            return [errorMessage, undefined];
        }
    }
}