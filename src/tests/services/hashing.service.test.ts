import { HashingService } from "../../services/hashing.service";
import bcrypt from "bcryptjs";

describe('HashingService', () => {

    const saltRounds = 7;
    const hashingService = new HashingService(saltRounds);
    const data = 'password123';

    describe('hash', () => {
        test('genSaltSync (bcrypt) should be called with salt rounds', () => {
            const genSaltSyncSpy = jest.spyOn(bcrypt, 'genSaltSync');
            hashingService.hash(data);
            expect(genSaltSyncSpy).toHaveBeenCalledWith(saltRounds);
        });

        test('hash (bcrypt) should be called with the resulting salt', () => {
            const genSaltSyncResult = 'test-result';
            jest.spyOn(bcrypt, 'genSaltSync')
                .mockReturnValue(genSaltSyncResult);

            // needed, otherwise throws an error due an invalid salt
            const hashMock = jest.spyOn(bcrypt, 'hash')
                .mockImplementationOnce(() => {});

            hashingService.hash(data);
            expect(hashMock).toHaveBeenCalledWith(data, genSaltSyncResult);
        });

        test('hash should be returned', async () => {
            const hashTestResult = '123';
            jest.spyOn(bcrypt, 'hash')
                .mockImplementation(() => hashTestResult);
            expect(hashingService.hash(data))
                .resolves.toBe(hashTestResult);
        });
    });

    describe('compare', () => {
        test('compare (bcrypt) should be called with hash and data', () => {
            const compareSpy = jest.spyOn(bcrypt, 'compare');
            const hashTest = '123';
            hashingService.compare(data, hashTest);
            expect(compareSpy).toHaveBeenCalledWith(data, hashTest);
        });

        test('compare should return the compare (bcrypt) result', () => {
            const result = true;
            jest.spyOn(bcrypt, 'compare')
                .mockImplementation(() => result);
            expect(hashingService.compare(data, 'foo'))
                .resolves.toBe(result);
        });
    });

});