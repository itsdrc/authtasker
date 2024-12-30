import bcrypt from "bcryptjs"
import { HashingService } from "@root/services";

describe('Hashing Service', () => {
    test('bcrypt.hash should be called with the specified salt rounds', async () => {
        const saltRounds = 3;
        const hashingService = new HashingService(3);

        const mockSalt = 'mock-salt';
        const genSaltMock = jest.spyOn(bcrypt, 'genSalt')
            .mockImplementation(() => mockSalt);
        const hashMock = jest.spyOn(bcrypt, 'hash').mockImplementation();

        const myPassword = 'test-password';
        await hashingService.hash(myPassword);

        expect(genSaltMock).toHaveBeenCalledWith(saltRounds);
        expect(hashMock).toHaveBeenCalledWith(myPassword, mockSalt);
    });

    describe('Workflow', () => {
        test('comparison between password and hashed password should be true', async () => {
            const saltRounds = 7;
            const hashingService = new HashingService(saltRounds);

            const password = 'test-password';
            const hash = await hashingService.hash(password);

            expect(hashingService.compare(hash, password)).toBeTruthy();
        });
    });
});