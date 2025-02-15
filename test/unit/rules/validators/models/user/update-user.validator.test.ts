import { faker } from "@faker-js/faker/.";
import { USER_CONSTANTS as CONSTS } from "@root/rules/constants/user.constants";
import { UpdateUserValidator } from "@root/rules/validators/models/user/update-user.validator";
import { UserDataGenerator } from "@root/seed/generators/user.generator";

describe('Update User validator', () => {
    const dataGenerator = new UserDataGenerator();

    describe('No properties provided', () => {
        test('should return an error indicating at least one property is needed', async () => {
            const [error, validated] = await UpdateUserValidator.validateAndTransform({});
            expect(validated).not.toBeDefined();
            expect(error).toBe('At least one field is required to update the user');
        });
    });

    describe('Unexpected property is provided', () => {
        test('should return an error ..', async () => {
            const userData = {
                name: dataGenerator.name(),
                role: 'admin',
            };

            const [error, validated] = await UpdateUserValidator.validateAndTransform(userData);
            expect(validated).not.toBeDefined();
            expect(error).toBe(`property role should not exist`)
        });
    });

    describe('Name', () => {
        describe('Name is too large', () => {
            test('should return an error indicating that name must be shorter', async () => {
                const invalidName = faker
                    .string
                    .alpha({ length: CONSTS.MAX_NAME_LENGTH + 1 });

                const [error, validated] = await UpdateUserValidator
                    .validateAndTransform({
                        name: invalidName,
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

                const [error, validated] = await UpdateUserValidator
                    .validateAndTransform({
                        name: invalidName,
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
                const [error, validated] = await UpdateUserValidator
                    .validateAndTransform({
                        name: `  ${name}   `,
                    });

                expect(error).not.toBeDefined();
                expect(validated?.name).toBe(name.toLowerCase().trim());
            });
        });
    });

    describe('Email', () => {
        describe('Provided "email" is not a valid email', () => {
            test('should return an error indicating email is not a valid email', async () => {
                const invalidEmail = faker.food.vegetable();

                const [error, validated] = await UpdateUserValidator
                    .validateAndTransform({
                        email: invalidEmail,
                    });

                expect(validated).not.toBeDefined();
                expect(error).toBe('email must be an email');
            });
        });
    });

    describe('Password', () => {
        describe('Password is too large', () => {
            test('should return an error indicating that password must be shorter', async () => {
                const invalidPassword = faker
                    .string
                    .alpha({ length: CONSTS.MAX_PASSWORD_LENGTH + 1 });

                const [error, validated] = await UpdateUserValidator
                    .validateAndTransform({
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

                const [error, validated] = await UpdateUserValidator
                    .validateAndTransform({
                        password: invalidPassword
                    });

                expect(validated).not.toBeDefined();
                expect(error)
                    .toBe(`password must be longer than or equal to ${CONSTS.MIN_PASSWORD_LENGTH} characters`)
            });
        });
    });

    describe('Data sucessfully validated', () => {
        test('should return the data', async () => {
            const userData = {
                name: dataGenerator.name(),
                email: dataGenerator.email(),
                password: dataGenerator.password()
            }

            const [error, validated] = await UpdateUserValidator
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