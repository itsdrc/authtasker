import * as classValidator from "class-validator";
import { faker } from "@faker-js/faker/.";

import { LoginUserValidator } from "@root/rules/validators/models/user";
import { validationOptionsConfig } from "@root/rules/validators/config/validation.config";

describe('LoginUserValidator', () => {
    describe('validate', () => {
        test('class-validator.validate should be called with the user with the provided data and the validation options', async () => {
            const testData: LoginUserValidator = {
                email: faker.internet.email(),
                password: faker.internet.password(),
            };

            const validateSpy = jest.spyOn(classValidator, 'validate')
                .mockImplementation(() => Promise.resolve([]));

            await LoginUserValidator.validate(testData);

            expect(validateSpy)
                .toHaveBeenCalledWith(
                    testData,
                    validationOptionsConfig
                );
        });
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

            const [errors, user] = await LoginUserValidator
                .validate({} as any);

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
});