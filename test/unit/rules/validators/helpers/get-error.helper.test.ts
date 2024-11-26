import { faker } from "@faker-js/faker/.";
import { getError } from "@root/rules/validators/helpers/get-error.helper";

const unexistingErrorMessage = 'Cannot identify the validation error';
const extraErrorsMessage = 'More than one error was found, which was not expected';

describe('getError helper', () => {
    describe('if only one error is provided', () => {
        test('should return the error message', () => {
            const testErrorMessage = faker.music.songName();
            const testValidationError = {
                constraints: { whitelistValidation: testErrorMessage }
            };

            // call helper with array containing the test error
            const testErrors = [testValidationError];
            const errorFound = getError(testErrors as any);

            expect(errorFound)
                .toBe(testErrorMessage);
        });
    });

    describe('if more than one error is provided', () => {
        describe('if all errors are whitelist validation error', () => {
            test('should return the first one', () => {
                const firstErrorMesage = faker.food.vegetable();
                const testValidationError1 = {
                    constraints: { whitelistValidation: firstErrorMesage }
                };
                const testValidationError2 = {
                    constraints: { whitelistValidation: faker.food.fruit() }
                };

                // call helper with array containing the test errors
                const testErrors = [testValidationError1, testValidationError2];
                const errorFound = getError(testErrors as any);

                expect(errorFound)
                    .toBe(firstErrorMesage);
            });
        });

        describe('if errors are not whitelist errors', () => {
            test('should throw a specific error', () => {
                // create errors that are not whitelists error
                const testErrors = [
                    { constraints: { anotherError: faker.food.vegetable() } },
                    { constraints: { anotherError: faker.food.fruit() } }
                ];

                // call helper with array containing the test errors                
                expect(() => {
                    getError(testErrors as any)
                }).toThrow(extraErrorsMessage);
            });
        });

        describe('if validation does not contain a constraints property', () => {
            test('should return a specific error message', () => {
                expect(() => {
                    // send a empty object inside the array
                    getError([{}] as any)
                }).toThrow(unexistingErrorMessage);
            });
        });

        describe('if one error is a whitelistValidation error and the others not', () => {
            test('should return a specific error', () => {
                const testErrors = [
                    { constraints: { anotherError: faker.book.title() } },
                    { constraints: { whitelist: faker.book.title() } },
                    { constraints: { anotherError: faker.book.title() } },
                ];

                expect(() => {                    
                    getError(testErrors as any)
                }).toThrow(extraErrorsMessage);
            });
        });
    });
});