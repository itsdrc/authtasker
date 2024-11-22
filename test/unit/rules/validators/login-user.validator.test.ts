import { faker } from "@faker-js/faker/.";

import { USER_VALIDATION_CONSTANTS as CONSTS } from "@root/rules/constants/user.constants";
import { generateGenericError, generateMissingPropertyMessage } from "@root/rules/validators/messages/generators";
import { LoginUserValidator } from "@root/rules/validators/models/user";

describe('LoginUserValidator', () => {

    describe('given a valid object', () => {
        test('should return the user and undefined error', async () => {
            const userForLogging = {
                email: faker.internet.email(),
                password: faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH })
            };

            const [error, validated] = await LoginUserValidator.validate(userForLogging);

            expect(error).not.toBeDefined();
            expect(validated).toBeDefined();
        });

        test('should return the user with the same properties', async () => {
            const userForLogging = {
                email: faker.internet.email(),
                password: faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH })
            };

            const [error, validated] = await LoginUserValidator.validate(userForLogging);

            expect(error).not.toBeDefined();
            expect(Object.keys(validated || {}))
                .toStrictEqual(Object.keys(userForLogging));
        });
    });

    describe('given an object with no properties', () => {
        test('should stop at first error', async () => {
            const userForLogging = {};

            const [error, validated] = await LoginUserValidator.validate(userForLogging);

            expect(validated).not.toBeDefined();
            // assuming "email" is the first property validated
            expect(error).toBe(generateMissingPropertyMessage('email'));
        });
    });

    describe('given a valid object with unexpected properties', () => {
        test('should return an error and undefined user', async () => {
            const newProperty = 'address';
            const userForLogging = {
                email: faker.internet.email(),
                password: faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH }),
                [newProperty]: 'earth'
            };

            const [error, validated] = await LoginUserValidator.validate(userForLogging);

            expect(validated).not.toBeDefined();
            expect(error).toBe(`property ${newProperty} should not exist`);
        });
    });    

    describe('given an object with valid properties but one is missing', () => {
        describe('email is missing', () => {
            test('should return an error and undefined user', async () => {
                const userForLogging = {
                    password: faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH }),
                };

                const [error, validated] = await LoginUserValidator.validate(userForLogging);

                expect(validated).not.toBeDefined();
                expect(error).toBe(generateMissingPropertyMessage('email'));
            });
        });

        describe('password is missing', () => {
            test('should return an error and undefined user', async () => {
                const userForLogging = {
                    email: faker.internet.email(),
                };

                const [error, validated] = await LoginUserValidator.validate(userForLogging);

                expect(validated).not.toBeDefined();
                expect(error).toBe(generateMissingPropertyMessage('password'));
            });
        });
    });

    describe('given an object with valid properties but one is invalid', () => {
        describe('invalid email', () => {
            test('should return a generic error and undefined user', async () => {
                const userForLogging = {
                    email: faker.food.vegetable(),
                    password: faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH }),
                };

                const [error, validated] = await LoginUserValidator.validate(userForLogging);

                expect(validated).not.toBeDefined();
                expect(error).toBe(generateGenericError('email'));
            });
        });

        describe('invalid password', () => {
            describe('password is not a string', ()=> {
                test('should return a generic error and undefined user', async () => {
                    const userForLogging = {
                        email: faker.internet.email(),
                        password: 10,
                    };

                    const [error, validated] = await LoginUserValidator.validate(userForLogging);

                    expect(validated).not.toBeDefined();
                    expect(error).toBe(generateGenericError('password'));
                });
            });          

            describe('password does not meet minimum length', ()=> {
                test('should return a generic error and undefined user', async () => {
                    const invalidLength = CONSTS.MIN_PASSWORD_LENGTH - 1;
                    const userForLogging = {
                        email: faker.internet.email(),
                        password: faker.internet.password({ length: invalidLength }),
                    };

                    const [error, validated] = await LoginUserValidator.validate(userForLogging);

                    expect(validated).not.toBeDefined();
                    expect(error).toBe(generateGenericError('password'));
                });
            });

            describe('password does not meet maximum length', ()=> {
                test('should return a generic error and undefined user', async () => {
                    const invalidLength = CONSTS.MAX_PASSWORD_LENGTH + 1;
                    const userForLogging = {
                        email: faker.internet.email(),
                        password: faker.internet.password({ length: invalidLength }),
                    };

                    const [error, validated] = await LoginUserValidator.validate(userForLogging);

                    expect(validated).not.toBeDefined();
                    expect(error).toBe(generateGenericError('password'));
                });
            });            
        });
    });

    describe('given an object with only invalid properties', () => {
        test('should stop at first error', async () => {
            const userForLogging = {
                email: faker.food.vegetable(),
                password: 10,
            };

            const [error, validated] = await LoginUserValidator.validate(userForLogging);

            expect(validated).not.toBeDefined();
            expect(error).toBe(generateGenericError('email'));
        });
    });
});