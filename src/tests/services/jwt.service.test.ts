import { JwtService } from "../../services/jwt.service";
import jwt from "jsonwebtoken";

describe('JwtService', () => {

    const expirationTime = '1h';
    const privateKey = 'private123'
    const jwtService = new JwtService(expirationTime, privateKey);
    const payload = { id: '123' } as const;

    describe('generate', () => {
        test('generate (jwt) should be called with payload, privateKey and expirationTime', () => {
            const signSpy = jest.spyOn(jwt, 'sign');
            jwtService.generate(payload);
            expect(signSpy).toHaveBeenCalledWith(
                payload,
                privateKey,
                { expiresIn: expirationTime }
            );
        });

        test('should return the generate (jwt) result', () => {
            const testResult = "token test 123";
            jest.spyOn(jwt, 'sign').mockImplementation(() => testResult);
            const token = jwtService.generate(payload);
            expect(token).toBe(testResult);
        });
    });

    describe('verify', () => {
        test('verify (jwt) should be called with token and private key', () => {
            const token = '12345';
            // disable error due to invalid token
            const verifySpy = jest.spyOn(jwt, 'verify')
                .mockImplementation(() => { });
            jwtService.verify(token);
            expect(verifySpy).toHaveBeenLastCalledWith(token, privateKey);
        });

        test('should return the payload', () => {
            const verifyReturnValue = payload;
            jest.spyOn(jwt, 'verify')
                .mockImplementation(() => verifyReturnValue);
            const res = jwtService.verify('');
            expect(res).toBe(verifyReturnValue);
        });
    });
});