import { LoginUserValidator } from "../../../rules/validators/login-user.validator";
import { omitProperty } from "../../helpers/omit-property.helper";

describe('LoginUserValidator', () => {

    const userToLogin = {
        email: 'test@gmail.com',
        password: 'test123'
    } as const;

    describe('validation successful', () => {
        test('should validate the user successfully', async () => {
            const [error, userValidated] = await LoginUserValidator.validate(userToLogin);
            expect(error).toBeUndefined();
            // dont try to use toStrictEqual here, or you'll need to make userToLogin 
            // an instance of LoginUserValidator. I prefer to use a manually check of keys number
            // in order to ensure no unintentional additional properties
            expect(userToLogin).toEqual(userValidated);
            expect(Object.keys(userToLogin)).toStrictEqual(Object.keys(userValidated as object));
        });
    });

    describe('validation failed', () => {
        describe('missing properties', () => {
            test('should fail if password is missing', async () => {
                const userNoPassword = omitProperty(userToLogin, 'password');
                const [error, userValidated] = await LoginUserValidator.validate(userNoPassword);
                expect(userValidated).toBeUndefined();
                expect(error).toStrictEqual(['password is required']);
            });

            test('should fail if email is missing', async () => {
                const userNoEmail = omitProperty(userToLogin, 'email');
                const [error, userValidated] = await LoginUserValidator.validate(userNoEmail);
                expect(userValidated).toBeUndefined();
                expect(error).toStrictEqual(['email is required']);
            });
        });

        describe('invalid properties', () => {
            test(`should fail if email is not a valid email`, async () => {
                const invalidUser: LoginUserValidator = structuredClone(userToLogin);
                invalidUser.email = "invalid-email";
                const [error] = await LoginUserValidator.validate(invalidUser);
                expect(error).toBeDefined();
                expect(error).toStrictEqual(['email must be an email']);
            });
        });
    });
});