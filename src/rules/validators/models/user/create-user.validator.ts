import { validate } from "class-validator";
import { ValidationResult } from "../../types/validation-result.type";
import { validationOptionsConfig } from "../../config/validation.config";
import { getErrors } from "../../helpers/get-errors.helper";
import { plainToInstance } from "class-transformer";
import { UserRoles } from "../../../../types/user/user-roles.type";
import { UserRequest } from "../../../../types/user/user-request.type";
import { Name } from "./decorators/name.decorator";
import { Email } from "./decorators/email.decorator";
import { Password } from "./decorators/password.decorator";
import { Role } from "./decorators/role.decorator";

export class CreateUserValidator implements UserRequest {

    @Name()
    name!: string;

    @Email()
    email!: string;

    @Password()
    password!: string;

    @Role()
    role!: UserRoles;

    // returns the object with validation and transformation applied
    static async validateAndTransform(body: object): ValidationResult<CreateUserValidator> {
        const user = new CreateUserValidator();
        Object.assign(user, body);
        try {
            const errors = await validate(user, validationOptionsConfig);
            if (errors.length > 0) {
                return [getErrors(errors), undefined];
            }
            return [undefined, plainToInstance(CreateUserValidator, user)];
        } catch (error) {
            const decoratorValidationError: Error = error as Error;
            return [[decoratorValidationError.message], undefined];
        }
    }
}