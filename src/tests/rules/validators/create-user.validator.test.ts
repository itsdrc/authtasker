import { USER_VALIDATION_CONSTANTS } from "../../../rules/constants/user.constants";
import { CreateUserValidator } from "../../../rules/validators/create-user.validator";
import { validRoles } from "../../../types/user/user-roles.type";
import { createString } from "../../helpers/string-creator.helper";

describe('CreateUserValidator', () => {
    const user = {
        name: " RandomUser ",
        email: "foo@gmail.com",
        password: "12345678",
        role: "admin"
    } as const;

    describe('validation successful', () => {
        it('should validate the user successfully', async () => {
            const [error, userValidated] = await CreateUserValidator.validateAndTransform(user);
            expect(error).toBeUndefined();
            expect(userValidated).toBeDefined();
        });

        it('should transform the name to lowercase and trim it', async () => {
            const [, userValidated] = await CreateUserValidator.validateAndTransform(user);
            expect(userValidated?.name).toBe(user.name.toLowerCase().trim());
        });
    });

    describe('validation failed', () => {
        const maxNameLength = USER_VALIDATION_CONSTANTS.MAX_NAME_LENGTH;
        const maxPasswordLength = USER_VALIDATION_CONSTANTS.MAX_PASSWORD_LENGTH;
        const minNameLength = USER_VALIDATION_CONSTANTS.MIN_NAME_LENGTH;
        const minPasswordLength = USER_VALIDATION_CONSTANTS.MIN_PASSWORD_LENGTH;

        it(`should fail if name length is greater than ${maxNameLength}`, async () => {
            const invalidUser: CreateUserValidator = structuredClone(user);
            invalidUser.name = createString(maxNameLength + 1);
            const [error] = await CreateUserValidator.validateAndTransform(invalidUser);
            expect(error).toBeDefined();
            expect(error).toStrictEqual([`name must be shorter than or equal to ${maxNameLength} characters`]);
        });

        it(`should fail if name length is less than ${minNameLength}`, async () => {
            const invalidUser: CreateUserValidator = structuredClone(user);
            invalidUser.name = createString(minNameLength - 1);
            const [error] = await CreateUserValidator.validateAndTransform(invalidUser);
            expect(error).toBeDefined();
            expect(error).toStrictEqual([`name must be longer than or equal to ${minNameLength} characters`]);
        });

        it(`should fail if email is not a valid email`, async () => {
            const invalidUser: CreateUserValidator = structuredClone(user);
            invalidUser.email = "invalid-email";
            const [error] = await CreateUserValidator.validateAndTransform(invalidUser);
            expect(error).toBeDefined();
            expect(error).toStrictEqual(['email must be an email']);
        });

        it(`should fail if password length is greater than ${maxPasswordLength}`, async () => {
            const invalidUser: CreateUserValidator = structuredClone(user);
            invalidUser.password = createString(maxPasswordLength + 1);
            const [error] = await CreateUserValidator.validateAndTransform(invalidUser);
            expect(error).toBeDefined();
            expect(error).toStrictEqual([`password must be shorter than or equal to ${maxPasswordLength} characters`]);
        });

        it(`should fail if password length is less than ${minPasswordLength}`, async () => {
            const invalidUser: CreateUserValidator = structuredClone(user);
            invalidUser.password = createString(minPasswordLength - 1);
            const [error] = await CreateUserValidator.validateAndTransform(invalidUser);
            expect(error).toBeDefined();
            expect(error).toStrictEqual([`password must be longer than or equal to ${minPasswordLength} characters`]);
        });

        it(`should fail if role is not a valid role`, async () => {
            const invalidUser: CreateUserValidator = structuredClone(user);
            invalidUser.role = 'new-role' as any;
            const [error] = await CreateUserValidator.validateAndTransform(invalidUser);
            expect(error).toBeDefined();            
            expect(error).toStrictEqual([`role must be one of the following values: ${validRoles.join(', ')}`]);
        });

        it('should fail if there are unexpected properties in the object', async()=>{
            const newProperty = 'unknownProperty';
            const invalidUser: any= structuredClone(user);
            invalidUser[newProperty] = 10;            
            const [error] = await CreateUserValidator.validateAndTransform(invalidUser);
            expect(error).toBeDefined();  
            expect(error).toStrictEqual([`property ${newProperty} should not exist`]);
        });
    });
}); 
