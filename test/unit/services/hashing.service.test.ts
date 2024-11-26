import { faker } from "@faker-js/faker/.";
import { HashingService } from "@root/services/hashing.service";
import bcrypt from "bcryptjs"

describe('HashingService', () => {
    describe('HASH', () => {
        test('bcrypt.genSalt should be called with the provided rounds', async () => {
            const testSaltRounds = faker.number.int();
            const hashingService = new HashingService(testSaltRounds);

            // stub bcrypt.hash
            jest.spyOn(bcrypt, 'hash')
                .mockImplementation()

            // spy bcrypt.genSalt and disable implementation
            const genSalt = jest.spyOn(bcrypt, 'genSalt')
                .mockImplementation();

            await hashingService.hash('');

            expect(genSalt)
                .toHaveBeenCalledWith(testSaltRounds);
        });

        test('bcrypt.hash should be called with the provided data and generated salt', async () => {
            const hashingService = new HashingService(faker.number.int());

            // mock genSalt result
            const saltMock = faker.food.vegetable();
            jest.spyOn(bcrypt as any, 'genSalt')
                .mockResolvedValue(saltMock);

            // spy bcrypt.hash and disable implementation
            const hashSpy = jest.spyOn(bcrypt, 'hash')
                .mockImplementation();

            // call method with test data 
            const testData = faker.internet.password();
            await hashingService.hash(testData);

            expect(hashSpy)
                .toHaveBeenLastCalledWith(testData, saltMock);
        });

        test('should return the hash returned by bcrypt.hash', async () => {
            const hashingService = new HashingService(faker.number.int());

            // stub genSalt
            jest.spyOn(bcrypt, 'genSalt')
                .mockImplementation();

            // mock bcrypt.hash to return a test hash
            const hashMock = faker.food.vegetable();
            jest.spyOn(bcrypt as any, 'hash')
                .mockResolvedValue(hashMock);

            const result = await hashingService.hash('');

            expect(result).toBe(hashMock);
        });
    });

    describe('COMPARE', () => {
        test('compare should be called with hash and data', async () => {
            const hashingService = new HashingService(faker.number.int());
            
            const testData = faker.food.vegetable();
            const testHash = faker.food.fruit();
        
            // spy bcrypt.compare and disable implementation
            const compareSpy = jest.spyOn(bcrypt as any, 'compare')
                .mockImplementation();

            hashingService.compare(testData, testHash);

            expect(compareSpy)
                .toHaveBeenCalledWith(testData, testHash);
        });
    });
});