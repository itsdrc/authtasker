import { validateOrReject } from "class-validator";
import { UserRequest } from "../../../../types/user/user-request.type";
import { Name } from "./decorators/name.decorator";
import { validationOptionsConfig } from "../../config/validation.config";
import { ValidationResult } from "../../types/validation-result.type";
import { getError } from "../../helpers/get-error.helper";
import { UserRoles } from "../../../../types/user/user-roles.type";
import { Role } from "./decorators/role.decorator";
import { Password } from "./decorators/password.decorator";
import { Email } from "./decorators/email.decorator";

export class UpdateUserValidator implements Partial<UserRequest> {

    @Name({ optional: true })
    name?: string;

    @Email({ optional: true })
    email?: string;

    @Password({ optional: true })
    password?: string;

    @Role({ optional: true })
    role?: UserRoles;

    static async validateAndTransform(body: any): ValidationResult<UpdateUserValidator> {
        const user = new UpdateUserValidator();
        Object.assign(user, body);

        // at least one property is required for updating
        if (Object.keys(body).length === 0)
            return ['At least one property is required', undefined];

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