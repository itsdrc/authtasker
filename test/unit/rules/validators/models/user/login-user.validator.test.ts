import { faker } from "@faker-js/faker/.";
import { USER_CONSTANTS as CONSTS } from "@root/rules/constants/user.constants";
import { LoginUserValidator } from "@root/rules/validators/models/user";
import { UserDataGenerator } from "@root/seed/generators/user.generator";

describe('LoginUserValidator', () => {
    const dataGenerator = new UserDataGenerator({ respectMinAndMaxLength: true });

    describe('Email', () => {
        describe('Email is missing', () => {
            test('should return an error indicating email is needed', async () => {
                const [error, validated] = await LoginUserValidator.validate({
                    password: faker.food.vegetable(),
                })

                expect(validated).not.toBeDefined();
                expect(error).toBe('email should not be null or undefined')
            });
        });

        describe('Provided "email" is not a valid email', () => {
            test('should return an error indicating email is not a valid email', async () => {
                const invalidEmail = faker.food.vegetable();

                const [error, validated] = await LoginUserValidator
                    .validate({
                        email: invalidEmail,
                        password: dataGenerator.password()
                    });

                expect(validated).not.toBeDefined();
                expect(error).toBe('email must be an email');
            });
        });
    });

    describe('Password', () => {
        describe('Password is missing', () => {
            test('should return an error indicating password is needed', async () => {
                const [error, validated] = await LoginUserValidator.validate({
                    email: dataGenerator.email()
                });

                expect(validated).not.toBeDefined();
                expect(error).toBe('password should not be null or undefined')
            });
        });

        describe('Password is not a string', () => {
            test('should return an error indicating password is not a valid string', async () => {
                const invalidPassword = 3000;

                const [error, validated] = await LoginUserValidator
                    .validate({
                        email: dataGenerator.email(),
                        password: invalidPassword
                    });

                expect(validated).not.toBeDefined();
                expect(error).toBe('password must be a string');
            });
        });

        // security
        describe('Password is too large', () => {
            test('should NOT return error', async () => {
                const aVeryLongPassword = faker
                    .string
                    .alpha({ length: CONSTS.MAX_PASSWORD_LENGTH + 1 });

                const [error, validated] = await LoginUserValidator
                    .validate({
                        email: dataGenerator.email(),
                        password: aVeryLongPassword
                    });

                expect(error).not.toBeDefined();
                expect(validated).toBeDefined();
            });
        });

        describe('Password is too short', () => {
            test('should NOT return error', async () => {
                const aVeryShortPassword = faker
                    .string
                    .alpha({ length: CONSTS.MIN_PASSWORD_LENGTH - 1 });

                const [error, validated] = await LoginUserValidator
                    .validate({
                        email: dataGenerator.email(),
                        password: aVeryShortPassword
                    });

                expect(error).not.toBeDefined();
                expect(validated).toBeDefined();
            });
        });
    });

    describe('Process sucesss', () => {
        test('should return the data', async () => {
            const userData = {
                email: faker.internet.email(),
                password: faker.internet.password()
            }

            const [error, validated] = await LoginUserValidator
                .validate(userData);

            expect(error).not.toBeDefined();            
            expect(validated).toMatchObject(userData);
            // no extra properties
            expect(Object.keys(Object(validated)))
                .toEqual(Object.keys(userData));
        });
    });
});