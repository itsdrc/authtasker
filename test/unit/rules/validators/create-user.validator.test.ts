import { faker } from '@faker-js/faker';

import {
    generateInvalidStringErrorMessage,
    generateMaxLengthErrorMessage,
    generateMinLengthErrorMessage,
    generateMissingPropertyMessage
} from '@root/rules/validators/messages/generators';
import { USER_VALIDATION_CONSTANTS as CONSTS } from '@root/rules/constants/user.constants';
import { CreateUserValidator } from '@root/rules/validators/models/user';
import { validRoles } from '@root/types/user/user-roles.type';
import { INVALID_EMAIL_MESSAGE } from '@root/rules/validators/messages/constants/invalid-email.message.constant';
import { INVALID_ROLE_MESSAGE } from '@root/rules/validators/messages/constants/invalid-role.message.constant';

describe('CreateUserValidator', () => {
    describe('given valid properties', () => {
        test('should return the user and undefined error', async () => {
            const user = {
                name: faker.string.alpha({ length: CONSTS.MIN_NAME_LENGTH }),
                email: faker.internet.email(),
                password: faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH }),
                role: validRoles[0],
            };

            const [error, validatedUser] = await CreateUserValidator
                .validateAndTransform(user);

            expect(error).not.toBeDefined();
            expect(validatedUser).toBeDefined();
        });

        test('should transform the name to lowercase and trim it', async () => {
            const username = ` ${faker.string.alpha({ length: CONSTS.MIN_NAME_LENGTH }).toUpperCase()} `;
            const user = {
                name: username,
                email: faker.internet.email(),
                password: faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH }),
                role: validRoles[0],
            };

            const [error, validatedUser] = await CreateUserValidator
                .validateAndTransform(user);

            expect(validatedUser).toBeDefined();
            expect(validatedUser?.name)
                .toBe(username.toLocaleLowerCase().trim());
        });

        test('should return the user with the same properties', async () => {
            const user = {
                name: faker.string.alpha({ length: CONSTS.MIN_NAME_LENGTH }),
                email: faker.internet.email(),
                password: faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH }),
                role: validRoles[0],
            };

            const [error, validatedUser] = await CreateUserValidator
                .validateAndTransform(user);

            expect(error).not.toBeDefined();
            expect(Object.keys(validatedUser || {}))
                .toStrictEqual(Object.keys(user));
        });
    });

    describe('given an object with no properties', () => {
        test('should stop at first error', async () => {
            const user = {};

            const [error, validatedUser] = await CreateUserValidator
                .validateAndTransform(user);

            expect(validatedUser).not.toBeDefined();
            // assuming "name" is the first property validated
            expect(error).toBe(generateMissingPropertyMessage('name'));
        });
    });

    describe('given an object with only invalid properties', () => {
        test('should stop at first error', async () => {
            const user = {
                name: 10,
                email: faker.food.meat(),
                password: 10,
                role: faker.food.vegetable(),
            };

            const [error, validatedUser] = await CreateUserValidator
                .validateAndTransform(user);

            expect(validatedUser).not.toBeDefined();
            // assuming "name" is the first property validated
            expect(error).toBe(generateInvalidStringErrorMessage('name'));
        });
    });

    describe('given an object with unexpected properties', () => {
        test('should return an error and undefined user', async () => {
            const newProperty = 'version';
            const user = {
                name: faker.string.alpha({ length: CONSTS.MIN_NAME_LENGTH }),
                email: faker.internet.email(),
                password: faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH }),
                role: validRoles[0],
                [newProperty]: '1.0.0',
            };

            const [error, validatedUser] = await CreateUserValidator
                .validateAndTransform(user);

            expect(validatedUser).not.toBeDefined();
            expect(error).toBe(`property ${newProperty} should not exist`)
        });
    });

    describe('given an object with valid properties but one is missing', () => {
        describe('name is missing', () => {
            test('should return an error and undefined user', async () => {
                const user = {
                    email: faker.internet.email(),
                    password: faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH }),
                    role: validRoles[0],
                };

                const [error, validatedUser] = await CreateUserValidator
                    .validateAndTransform(user);

                expect(validatedUser).not.toBeDefined();
                expect(error).toBe(generateMissingPropertyMessage('name'));
            });
        });

        describe('email is missing', () => {
            test('should return an error and undefined user', async () => {
                const user = {
                    name: faker.string.alpha({ length: CONSTS.MIN_NAME_LENGTH }),
                    password: faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH }),
                    role: validRoles[0],
                };

                const [error, validatedUser] = await CreateUserValidator
                    .validateAndTransform(user);

                expect(validatedUser).not.toBeDefined();
                expect(error).toBe(generateMissingPropertyMessage('email'));
            });
        });

        describe('password is missing', () => {
            test('should return an error and undefined user', async () => {
                const user = {
                    name: faker.string.alpha({ length: CONSTS.MIN_NAME_LENGTH }),
                    email: faker.internet.email(),
                    role: validRoles[0],
                };

                const [error, validatedUser] = await CreateUserValidator
                    .validateAndTransform(user);

                expect(validatedUser).not.toBeDefined();
                expect(error).toBe(generateMissingPropertyMessage('password'));
            });
        });

        describe('role is missing', () => {
            test('should return an error and undefined user', async () => {
                const user = {
                    name: faker.string.alpha({ length: CONSTS.MIN_NAME_LENGTH }),
                    password: faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH }),
                    email: faker.internet.email(),
                };

                const [error, validatedUser] = await CreateUserValidator
                    .validateAndTransform(user);

                expect(validatedUser).not.toBeDefined();
                expect(error).toBe(generateMissingPropertyMessage('role'));
            });
        });
    });

    describe('given an object with valid properties but one is invalid', () => {
        describe('invalid name', () => {
            describe('name is not a string', () => {
                test('should return an error and undefined user', async () => {
                    const user = {
                        name: 10,
                        email: faker.internet.email(),
                        password: faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH }),
                        role: validRoles[0],
                    };

                    const [error, validatedUser] = await CreateUserValidator
                        .validateAndTransform(user);

                    expect(validatedUser).not.toBeDefined();
                    expect(error).toBe(generateInvalidStringErrorMessage('name'));
                });
            });

            describe('name does not meet the minimum length', () => {
                test('should return an error and undefined user', async () => {
                    const invalidLength = CONSTS.MIN_NAME_LENGTH - 1;
                    const user = {
                        name: faker.string.alpha({ length: invalidLength }),
                        email: faker.internet.email(),
                        password: faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH }),
                        role: validRoles[0],
                    };

                    const [error, validatedUser] = await CreateUserValidator
                        .validateAndTransform(user);

                    expect(validatedUser).not.toBeDefined();
                    expect(error).toBe(generateMinLengthErrorMessage(
                        'name',
                        CONSTS.MIN_NAME_LENGTH
                    ));
                });
            });

            describe('name does not meet the maximum length', ()=> {
                test('should return an error and undefined user', async () => {
                    const invalidLength = CONSTS.MAX_NAME_LENGTH + 1;
                    const user = {
                        name: faker.string.alpha({ length: invalidLength }),
                        email: faker.internet.email(),
                        password: faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH }),
                        role: validRoles[0],
                    };

                    const [error, validatedUser] = await CreateUserValidator
                        .validateAndTransform(user);

                    expect(validatedUser).not.toBeDefined();
                    expect(error).toBe(generateMaxLengthErrorMessage(
                        'name',
                        CONSTS.MAX_NAME_LENGTH
                    ));
                });
            });
        });

        describe('invalid email', () => {
            describe('email is not a valid email', () => {
                test('should return an error and undefined user', async () => {
                    const user = {
                        name: faker.string.alpha({ length: CONSTS.MIN_NAME_LENGTH }),
                        email: faker.animal.bird(),
                        password: faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH }),
                        role: validRoles[0],
                    };

                    const [error, validatedUser] = await CreateUserValidator
                        .validateAndTransform(user);

                    expect(validatedUser).not.toBeDefined();
                    expect(error).toBe(INVALID_EMAIL_MESSAGE);
                });
            });
        });

        describe('invalid password', () => {
            describe('password is not a string', () => {
                test('should return an error and undefined user', async () => {
                    const user = {
                        name: faker.string.alpha({ length: CONSTS.MIN_NAME_LENGTH }),
                        email: faker.internet.email(),
                        password: 10,
                        role: validRoles[0],
                    };

                    const [error, validatedUser] = await CreateUserValidator
                        .validateAndTransform(user);

                    expect(validatedUser).not.toBeDefined();
                    expect(error).toBe(generateInvalidStringErrorMessage('password'));
                });
            });

            describe('password does not meet minimum length', () => {
                test('should return an error and undefined user', async () => {
                    const invalidLength = CONSTS.MIN_PASSWORD_LENGTH - 1;
                    const user = {
                        name: faker.string.alpha({ length: CONSTS.MIN_NAME_LENGTH }),
                        email: faker.internet.email(),
                        password: faker.internet.password({ length: invalidLength }),
                        role: validRoles[0],
                    };

                    const [error, validatedUser] = await CreateUserValidator
                        .validateAndTransform(user);

                    expect(validatedUser).not.toBeDefined();
                    expect(error).toBe(generateMinLengthErrorMessage(
                        'password',
                        CONSTS.MIN_PASSWORD_LENGTH
                    ));
                });
            });

            describe('password does not meet maximum length', () => {
                test('should return an error and undefined user', async () => {
                    const invalidLength = CONSTS.MAX_PASSWORD_LENGTH + 1;
                    const user = {
                        name: faker.string.alpha({ length: CONSTS.MIN_NAME_LENGTH }),
                        email: faker.internet.email(),
                        password: faker.internet.password({ length: invalidLength }),
                        role: validRoles[0],
                    };

                    const [error, validatedUser] = await CreateUserValidator
                        .validateAndTransform(user);

                    expect(validatedUser).not.toBeDefined();
                    expect(error).toBe(generateMaxLengthErrorMessage(
                        'password',
                        CONSTS.MAX_PASSWORD_LENGTH
                    ));
                });
            });
        });

        describe('invalid role', () => {
            describe('role is not a stirng', () => {
                test('should return an error and undefined user', async () => {
                    const user = {
                        name: faker.string.alpha({ length: CONSTS.MIN_NAME_LENGTH }),
                        email: faker.internet.email(),
                        password: faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH }),
                        role: 10,
                    };

                    const [error, validatedUser] = await CreateUserValidator
                        .validateAndTransform(user);

                    expect(validatedUser).not.toBeDefined();
                    expect(error).toBe(generateInvalidStringErrorMessage('role'));
                });
            });

            describe('role is not a defined role', () => {
                test('should return an error and undefined user', async () => {
                    const user = {
                        name: faker.string.alpha({ length: CONSTS.MIN_NAME_LENGTH }),
                        email: faker.internet.email(),
                        password: faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH }),
                        role: faker.food.vegetable(),
                    };

                    const [error, validatedUser] = await CreateUserValidator
                        .validateAndTransform(user);

                    expect(validatedUser).not.toBeDefined();
                    expect(error).toBe(INVALID_ROLE_MESSAGE);
                });
            });
        });
    });
});