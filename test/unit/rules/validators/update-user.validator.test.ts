import * as classValidator from "class-validator";
import * as classTransformer from "class-transformer";
import { faker } from "@faker-js/faker/.";

import { validRoles } from "@root/types/user/user-roles.type";
import { validationOptionsConfig } from "@root/rules/validators/config/validation.config";
import { UpdateUserValidator } from "@root/rules/validators/models/user/update-user.validator";

describe('UpdateUserValidator', () => {
    describe('if data does not contain properties', () => {
        test('should return error and undefined user', async () => {
            const [error, user] = await UpdateUserValidator
                .validateAndTransform({} as any);

            expect(user).not.toBeDefined();
            expect(error).toStrictEqual([{
                property: expect.anything(),
                constraints: { message: expect.any(String) }
            }]);
        });

        test('class-validator.validate should NOT be called', async () => {
            // spy and disable (just in case) class-validator validate function
            const validateSpy = jest.spyOn(classValidator, 'validate')
                .mockImplementation(() => Promise.resolve([]));

            await UpdateUserValidator.validateAndTransform({} as any);

            expect(validateSpy).not.toHaveBeenCalled();
        });
    });

    test('class-validator.validate should be called with the user with the provided data and the validation options', async () => {
        const testData: UpdateUserValidator = {
            name: faker.internet.username(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: validRoles[1],
        };

        // spy and disable implementation, returns an array 
        // to disable errors when length is called
        const validateSpy = jest.spyOn(classValidator, 'validate')
            .mockImplementation(() => Promise.resolve([]));

        await UpdateUserValidator.validateAndTransform(testData);

        // assert is called with the test data and the global validation config
        expect(validateSpy)
            .toHaveBeenLastCalledWith(
                testData,
                validationOptionsConfig
            );
    });

    describe('if class-validator.validate returns validation errors', () => {
        test('should return the errors (only property and constraints) and undefined user', async () => {
            // test errors
            const validationError1 = {
                property: faker.food.vegetable(),
                constraints: { lengthError: faker.food.fruit() },
                anotherProperty: faker.animal.cat(),
            };

            const validationError2 = {
                property: faker.food.vegetable(),
                constraints: { lengthError: faker.food.fruit() },
                anotherProperty: faker.animal.cat(),
            };

            // mock class-validator.validate to return a test errors
            jest.spyOn(classValidator, 'validate')
                .mockResolvedValue([validationError1, validationError2]);

            const [errors, user] = await UpdateUserValidator
                .validateAndTransform({propToAvoidError: undefined} as any);

            // assert errors are returned and only contain
            // "property" and "constraints" properties
            expect(user).not.toBeDefined();
            expect(errors).toStrictEqual([
                {
                    property: validationError1.property,
                    constraints: validationError1.constraints
                },
                {
                    property: validationError2.property,
                    constraints: validationError2.constraints
                }
            ]);
        });
    });

    describe('if class-validator.validate does not return errors', () => {
        test('should return the converted user and undefined errors', async () => {
            // mock class-transformer to return a test user
            const testUser = { name: faker.internet.username() };
            jest.spyOn(classTransformer, 'plainToInstance')
                .mockReturnValue(testUser);

            // returns an empty array to disable errors logic
            jest.spyOn(classValidator, 'validate')
                .mockImplementation(() => Promise.resolve([]));

            const [errors, user] = await UpdateUserValidator
                .validateAndTransform({ propToAvoidError: undefined } as any);

            expect(errors).not.toBeDefined();
            expect(user).toStrictEqual(testUser);
        });
    });
});