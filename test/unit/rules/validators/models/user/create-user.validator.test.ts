import { faker } from "@faker-js/faker/.";
import { USER_CONSTANTS as CONSTS } from "@root/rules/constants/user.constants";
import { CreateUserValidator } from "@root/rules/validators/models/user";
import { UserDataGenerator } from "@root/seed/generators/user.generator";

describe('CreateUserValidator', () => {
    const dataGenerator = new UserDataGenerator({ respectMinAndMaxLength: true });

    describe('Name', () => {
        describe('Name is missing', () => {
            test('should return an error indicating name is needed', async () => {
                const [error, validated] = await CreateUserValidator
                    .validateAndTransform({
                        // no name sent
                        email: dataGenerator.email(),
                        password: dataGenerator.password()
                    });

                expect(validated).not.toBeDefined();
                expect(error).toBe('name should not be null or undefined');
            });
        });

        describe('Name is not a string', () => {
            test('should return an error indicating name must be a string', async () => {
                const invalidName = 2247248923;

                const [error, validated] = await CreateUserValidator
                    .validateAndTransform({
                        email: dataGenerator.email(),
                        password: dataGenerator.password(),
                        name: invalidName
                    });

                expect(validated).not.toBeDefined();
                expect(error).toBe('name must be a string');
            });
        });

        describe('Name is too long', () => {
            test('should return an error indicating that name must be shorter', async () => {
                const invalidName = faker
                    .string
                    .alpha({ length: CONSTS.MAX_NAME_LENGTH + 1 });

                const [error, validated] = await CreateUserValidator
                    .validateAndTransform({
                        name: invalidName,
                        email: dataGenerator.email(),
                        password: dataGenerator.password()
                    });

                expect(validated).not.toBeDefined();
                expect(error)
                    .toBe(`name must be shorter than or equal to ${CONSTS.MAX_NAME_LENGTH} characters`)
            });
        });

        describe('Name is too short', () => {
            test('should return an error indicating that name must be longer', async () => {
                const invalidName = faker
                    .string
                    .alpha({ length: CONSTS.MIN_NAME_LENGTH - 1 });

                const [error, validated] = await CreateUserValidator
                    .validateAndTransform({
                        name: invalidName,
                        email: dataGenerator.email(),
                        password: dataGenerator.password()
                    });

                expect(validated).not.toBeDefined();
                expect(error)
                    .toBe(`name must be longer than or equal to ${CONSTS.MIN_NAME_LENGTH} characters`)
            });
        });

        describe('Name is valid', () => {
            test('should be converted to lowercase and trim', async () => {
                const name = faker
                    .string
                    .alpha({ length: CONSTS.MIN_NAME_LENGTH })
                    .toUpperCase()

                // send name with initial and final spaces
                const [error, validated] = await CreateUserValidator
                    .validateAndTransform({
                        name: `  ${name}   `,
                        email: dataGenerator.email(),
                        password: dataGenerator.password()
                    });

                expect(error).not.toBeDefined();
                expect(validated?.name).toBe(name.toLowerCase().trim());
            });
        });
    });

    describe('Email', () => {
        describe('Email is missing', () => {
            test('should return an error indicating email is needed', async () => {
                const [error, validated] = await CreateUserValidator
                    .validateAndTransform({
                        // no email sent
                        name: dataGenerator.name(),
                        password: dataGenerator.password()
                    });

                expect(validated).not.toBeDefined();
                expect(error).toBe('email should not be null or undefined');
            });
        });

        describe('Email is not a string', () => {
            test('should return an error indicating email must be an email', async () => {
                const invalidEmail = 1111;

                const [error, validated] = await CreateUserValidator
                    .validateAndTransform({
                        name: dataGenerator.name(),
                        password: dataGenerator.password(),
                        email: invalidEmail,
                    });

                expect(validated).not.toBeDefined();
                expect(error).toBe('email must be an email');
            });
        });

        describe('Provided "email" is not a valid email', () => {
            test('should return an error indicating email is not a valid email', async () => {
                const invalidEmail = faker.food.vegetable();

                const [error, validated] = await CreateUserValidator
                    .validateAndTransform({
                        email: invalidEmail,
                        name: dataGenerator.name(),
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
                const [error, validated] = await CreateUserValidator
                    .validateAndTransform({
                        // no password sent
                        name: dataGenerator.name(),
                        email: dataGenerator.email(),
                    });

                expect(validated).not.toBeDefined();
                expect(error).toBe('password should not be null or undefined');
            });
        });

        describe('Password is not a string', () => {
            test('should return an error indicating password must be a string', async () => {
                const invalidPassword = 113433;

                const [error, validated] = await CreateUserValidator
                    .validateAndTransform({
                        name: dataGenerator.name(),
                        email: dataGenerator.email(),
                        password: invalidPassword
                    });

                expect(validated).not.toBeDefined();
                expect(error).toBe('password must be a string');
            });
        });

        describe('Password is too long', () => {
            test('should return an error indicating that password must be shorter', async () => {
                const invalidPassword = faker
                    .string
                    .alpha({ length: CONSTS.MAX_PASSWORD_LENGTH + 1 });

                const [error, validated] = await CreateUserValidator
                    .validateAndTransform({
                        name: dataGenerator.name(),
                        email: dataGenerator.email(),
                        password: invalidPassword
                    });

                expect(validated).not.toBeDefined();
                expect(error)
                    .toBe(`password must be shorter than or equal to ${CONSTS.MAX_PASSWORD_LENGTH} characters`)
            });
        });

        describe('Password is too short', () => {
            test('should return an error indicating that password must be longer', async () => {
                const invalidPassword = faker
                    .string
                    .alpha({ length: CONSTS.MIN_PASSWORD_LENGTH - 1 });

                const [error, validated] = await CreateUserValidator
                    .validateAndTransform({
                        name: dataGenerator.name(),
                        email: dataGenerator.email(),
                        password: invalidPassword
                    });

                expect(validated).not.toBeDefined();
                expect(error)
                    .toBe(`password must be longer than or equal to ${CONSTS.MIN_PASSWORD_LENGTH} characters`)
            });
        });
    });

    describe('Unexpected property is provided', () => {
        test('should return an error indicating the property must not exist', async () => {
            const invalidProperty = 10;

            const [error, validated] = await CreateUserValidator
                .validateAndTransform({
                    name: dataGenerator.name(),
                    email: dataGenerator.email(),
                    password: dataGenerator.password(),
                    invalidProperty,
                });

            expect(validated).not.toBeDefined();
            expect(error).toBe(`property invalidProperty should not exist`);
        });
    });

    describe('Data sucessfully validated', () => {
        test('should return the data', async () => {
            const userData = {
                name: dataGenerator.name(),
                email: dataGenerator.email(),
                password: dataGenerator.password()
            }

            const [error, validated] = await CreateUserValidator
                .validateAndTransform(userData);

            expect(error).not.toBeDefined();
            expect(validated).toMatchObject({
                ...userData,
                name: userData.name.toLowerCase().trim()
            });
            // no extra properties
            expect(Object.keys(Object(validated)))
                .toEqual(Object.keys(userData));
        });
    });
});