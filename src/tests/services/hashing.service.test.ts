import { HashingService } from "../../services/hashing.service";
import bcrypt, { compare } from "bcryptjs";

describe('HashingService', () => {
    const saltRounds = 7;
    const hashingService = new HashingService(saltRounds);
    const data = 'password123';

    let genSaltSyncSpy: jest.SpyInstance;
    let hashSpy: jest.SpyInstance;
    let compareSpy: jest.SpyInstance;

    beforeEach(() => {
        genSaltSyncSpy = jest.spyOn(bcrypt, 'genSaltSync');

        hashSpy = jest.spyOn(bcrypt, 'hash')
            .mockImplementation(() => {});

        compareSpy = jest.spyOn(bcrypt, 'compare')
            .mockImplementation(() => {});
    });

    describe('hash', () => {        
        test('genSaltSync (bcrypt) should be called with salt rounds', () => {
            hashingService.hash(data);
            expect(genSaltSyncSpy).toHaveBeenCalledWith(saltRounds);
        });

        test('hash (bcrypt) should be called with the resulting salt', () => {
            const genSaltSyncResult = 'test-result';
            genSaltSyncSpy.mockReturnValue(genSaltSyncResult);
            hashingService.hash(data);
            expect(hashSpy).toHaveBeenCalledWith(data, genSaltSyncResult);
        });

        test('hash should be returned', async () => {
            const hashTestResult = '123';
            hashSpy.mockReturnValue(hashTestResult);
            expect(hashingService.hash(data))
                .resolves
                .toBe(hashTestResult);
        });
    });

    describe('compare', () => {
        test('compare (bcrypt) should be called with hash and data', () => {
            const hashTest = '123';
            hashingService.compare(data, hashTest);
            expect(compareSpy).toHaveBeenCalledWith(data, hashTest);
        });

        test('compare should return the compare (bcrypt) result', () => {
            const result = true;
            compareSpy.mockReturnValue(result);
            expect(hashingService.compare(data, 'foo'))
                .resolves
                .toBe(result);
        });
    });
});