import { IsDefined, IsEmail, IsIn, IsString, MaxLength, validate, validateOrReject } from "class-validator";
import { UserInterface } from "../../interfaces/user.interface";
import { Roles, validRoles } from "../../types/roles.type";
import { getErrors } from "./helpers/get-errors.helper";
import { toLowerCase } from "./helpers/to-lowercase.helper";
import { plainToInstance, Transform } from "class-transformer";
import { validationOptionsConfig } from "./config/validation.config";
import { ValidationResult } from "./types/validation-result.type";
import { USER_VALIDATION_CONSTANTS } from "../constants/user.constants";

export class CreateUserValidator implements Omit<UserInterface, 'id' | 'createdAt'> {

    @IsDefined()
    @IsString()
    @MaxLength(USER_VALIDATION_CONSTANTS.MAX_NAME_LENGTH)
    @Transform(toLowerCase)
    name!: string;

    @IsDefined()
    @IsEmail()
    email!: string;

    @IsDefined()
    @IsString()
    @MaxLength(USER_VALIDATION_CONSTANTS.MAX_PASSWORD_LENGTH)
    password!: string;

    @IsDefined()
    @IsString()
    @IsIn(validRoles)
    role!: Roles;

    // returns the object with validation and transformation applied
    static async create(body: object): ValidationResult<CreateUserValidator> {
        const user = new CreateUserValidator();
        Object.assign(user, body);
        const errors = await validate(user, validationOptionsConfig);
        if (errors.length > 0) return [getErrors(errors), undefined];
        return [undefined, plainToInstance(CreateUserValidator, user)];
    }
}