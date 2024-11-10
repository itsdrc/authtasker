import { JwtService } from "../../services/jwt.service";
import jwt from "jsonwebtoken";

describe('JwtService', () => {
    const expirationTime = '1h';
    const privateKey = 'private123'
    const jwtService = new JwtService(expirationTime, privateKey);
    const payload = { id: '123' } as const;

    let signSpy: jest.SpyInstance;
    let verifySpy: jest.SpyInstance;

    beforeEach(() => {
        signSpy = jest.spyOn(jwt, 'sign')
            .mockImplementation(() => {});

        verifySpy = jest.spyOn(jwt, 'verify')
            .mockImplementation(() => {});
    });

    describe('generate', () => {
        test('jwt.generate should be called with payload, privateKey and expirationTime', () => {
            jwtService.generate(payload);
            expect(signSpy).toHaveBeenCalledWith(
                payload,
                privateKey,
                { expiresIn: expirationTime }
            );
        });

        test('should return the jwt.generate result', () => {
            const testResult = "token test 123";
            signSpy.mockReturnValue(testResult);
            const token = jwtService.generate(payload);
            expect(token).toBe(testResult);
        });
    });

    describe('verify', () => {
        test('jwt.verify should be called with token and private key', () => {
            const token = '12345';
            jwtService.verify(token);
            expect(verifySpy).toHaveBeenLastCalledWith(token, privateKey);
        });

        test('should return the payload', () => {
            const verifyReturnValue = payload;
            verifySpy.mockReturnValue(verifyReturnValue);
            const res = jwtService.verify('');
            expect(res).toBe(verifyReturnValue);
        });
    });
});