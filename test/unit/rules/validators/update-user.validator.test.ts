import { faker } from "@faker-js/faker/.";
import { INVALID_EMAIL_MESSAGE } from "@root/rules/validators/messages/constants/invalid-email.message.constant";
import { UpdateUserValidator } from "@root/rules/validators/models/user/update-user.validator";
import { validRoles } from "@root/types/user/user-roles.type";
import { USER_VALIDATION_CONSTANTS as CONSTS } from "@root/rules/constants/user.constants";
import { generateInvalidStringErrorMessage, generateMaxLengthErrorMessage, generateMinLengthErrorMessage } from "@root/rules/validators/messages/generators";
import { INVALID_ROLE_MESSAGE } from "@root/rules/validators/messages/constants/invalid-role.message.constant";

describe('UpdateUserValidator', () => {
    describe('given an object with no properties', () => {
        test('should return an error and undefined user new data', async () => {
            const update = {};

            const [error, validated] = await UpdateUserValidator.
                validateAndTransform(update);

            expect(validated).not.toBeDefined();
            expect(error).toBeDefined();
        });
    });

    describe('given an object with missing properties', () => {
        describe('if existing properties are NOT valid', () => {
            test('should return an error and undefined user new data', async () => {
                const update = {
                    email: faker.food.vegetable()
                };

                const [error, validated] = await UpdateUserValidator
                    .validateAndTransform(update);

                expect(validated).not.toBeDefined();
                expect(error).toBe(INVALID_EMAIL_MESSAGE);
            });
        });

        describe('if existing properties are valid ', () => {
            test('should return the user new data and undefined error', async () => {
                const update = {
                    email: faker.internet.email(),
                };

                const [error, validated] = await UpdateUserValidator.
                    validateAndTransform(update);

                expect(validated).toBeDefined();
                expect(error).not.toBeDefined();
            });
        });
    });

    describe('given a valid object with unexpected properties', () => {
        test('should return an error and undefined user new data', async () => {
            const newProperty = 'newprop';
            const update = {
                email: faker.internet.email(),
                role: validRoles[0],
                [newProperty]: 0,
            };

            const [error, validated] = await UpdateUserValidator.
                validateAndTransform(update);

            expect(validated).not.toBeDefined();
            expect(error).toBe(`property ${newProperty} should not exist`)
        });
    });

    describe('given an object with valid properties', () => {
        test('should return the object with the same properties', async () => {
            const update = {
                email: faker.internet.email(),
                role: validRoles[0],
            };

            const [error, validated] = await UpdateUserValidator.
                validateAndTransform(update);

            expect(Object.keys(validated || {}))
                .toStrictEqual(Object.keys(update));
        });

        test('should transform the name to lowercase and trim it', async () => {
            const name = ` ${faker.string.alpha({ length: CONSTS.MIN_NAME_LENGTH }).toUpperCase()} `;
            const update = { name };

            const [error, validated] = await UpdateUserValidator.
                validateAndTransform(update);

            expect(validated?.name)
                .toBe(name.toLowerCase().trim());
        });
    });

    describe('given an object with only invalid properties', () => {
        test('should stop at first error', async () => {
            const update = {
                name: 10,
                email: faker.food.meat(),
                password: 10,
                role: faker.food.vegetable(),
            };

            const [error, validated] = await UpdateUserValidator.
                validateAndTransform(update);

            expect(validated).not.toBeDefined();
            expect(error).toBe(generateInvalidStringErrorMessage('name'));
        });
    });

    describe('given an object with invalid properties', () => {
        describe('invalid name', () => {
            describe('name is not a string', () => {
                test('should return an error and undefined user new data', async () => {
                    const update = {
                        name: 10
                    };

                    const [error, validated] = await UpdateUserValidator.
                        validateAndTransform(update);

                    expect(validated).not.toBeDefined();
                    expect(error).toBe(generateInvalidStringErrorMessage('name'));
                });
            });

            describe('name does not match the minimum length', () => {
                test('should return an error and undefined user new data', async () => {
                    const update = {
                        name: faker.string.alpha({ length: CONSTS.MIN_NAME_LENGTH - 1 })
                    };

                    const [error, validated] = await UpdateUserValidator.
                        validateAndTransform(update);

                    expect(validated).not.toBeDefined();
                    expect(error).toBe(generateMinLengthErrorMessage(
                        'name',
                        CONSTS.MIN_NAME_LENGTH
                    ));
                });
            });

            describe('name does not match the maximum length', () => {
                test('should return an error and undefined user new data', async () => {
                    const update = {
                        name: faker.string.alpha({ length: CONSTS.MAX_NAME_LENGTH + 1 })
                    };

                    const [error, validated] = await UpdateUserValidator.
                        validateAndTransform(update);

                    expect(validated).not.toBeDefined();
                    expect(error).toBe(generateMaxLengthErrorMessage(
                        'name',
                        CONSTS.MAX_NAME_LENGTH
                    ));
                });
            });
        });

        describe('invalid email', () => {
            describe('email is not a valid email', () => {
                test('should return an error and undefined user new data', async () => {
                    const update = {
                        email: faker.food.ingredient()
                    };

                    const [error, validated] = await UpdateUserValidator.
                        validateAndTransform(update);

                    expect(validated).not.toBeDefined();
                    expect(error).toBe(INVALID_EMAIL_MESSAGE);
                });
            });
        });

        describe('invalid password', () => {
            describe('password is not a string', () => {
                test('should return an error and undefined user new data', async () => {
                    const update = {
                        password: 123
                    };

                    const [error, validated] = await UpdateUserValidator.
                        validateAndTransform(update);

                    expect(validated).not.toBeDefined();
                    expect(error).toBe(generateInvalidStringErrorMessage('password'));
                });
            });

            describe('password does not meet minimum length', () => {
                test('should return an error and undefined user new data', async () => {
                    const invalidLength = CONSTS.MIN_PASSWORD_LENGTH - 1;
                    const update = {
                        password: faker.internet.password({ length: invalidLength })
                    };

                    const [error, validated] = await UpdateUserValidator.
                        validateAndTransform(update);

                    expect(validated).not.toBeDefined();
                    expect(error).toBe(generateMinLengthErrorMessage(
                        'password'
                        , CONSTS.MIN_PASSWORD_LENGTH
                    ));
                });
            });

            describe('password does not meet the maximum length', () => {
                test('should return an error and undefined user new data', async () => {
                    const invalidLength = CONSTS.MAX_PASSWORD_LENGTH + 1;
                    const update = {
                        password: faker.internet.password({ length: invalidLength })
                    };

                    const [error, validated] = await UpdateUserValidator.
                        validateAndTransform(update);

                    expect(validated).not.toBeDefined();
                    expect(error).toBe(generateMaxLengthErrorMessage(
                        'password'
                        , CONSTS.MAX_PASSWORD_LENGTH
                    ));
                });
            });
        });

        describe('invalid role', () => {
            describe('role is not a defined role', () => {
                test('should return an error and undefined user new data', async () => {
                    const update = {
                        role: faker.vehicle.fuel()
                    };

                    const [error, validated] = await UpdateUserValidator.
                        validateAndTransform(update);

                    expect(validated).not.toBeDefined();
                    expect(error).toBe(INVALID_ROLE_MESSAGE);
                });
            });
        });
    });
});