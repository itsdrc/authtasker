import { validateOrReject } from "class-validator";
import { ValidationResult } from "../../types/validation-result.type";
import { validationOptionsConfig } from "../../config/validation.config";
import { getError } from "../../helpers/get-error.helper";
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
            await validateOrReject(user, validationOptionsConfig);
            return [undefined, plainToInstance(CreateUserValidator, user)];
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