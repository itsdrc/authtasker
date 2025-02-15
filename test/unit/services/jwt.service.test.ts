import jwt from "jsonwebtoken";
import * as UUID from 'uuid';
import { JwtService } from "@root/services";

describe('Jwt Service', () => {
    test('should return null if token is not valid', async () => {
        const jwtService = new JwtService('1234');

        const tokenVerified = jwtService.verify<{ id: string }>('invalid-token');

        expect(tokenVerified).toBeNull();
    });

    test('jwt.sign should be called with the provided payload, expiration time and private key', async () => {
        const expirationTime = '10m';
        const privateKey = 'my-private-key';

        const jwtSignSpy = jest.spyOn(jwt, 'sign');
        const testPayload = { id: '123' };

        const jwtService = new JwtService(privateKey);
        jwtService.generate(expirationTime, testPayload);

        expect(jwtSignSpy).toHaveBeenCalledWith(
            testPayload, privateKey,
            { expiresIn: expirationTime }
        );
    });

    test('jwt.verify should be called with the provided hash and private key', async () => {
        const privateKey = 'my-private-key';

        const jwtVerifySpy = jest.spyOn(jwt, 'verify');
        const testHash = 'abc1234';

        const jwtService = new JwtService(privateKey);
        jwtService.verify(testHash);

        expect(jwtVerifySpy).toHaveBeenCalledWith(testHash, privateKey);
    });

    test('a valid jti (uuid) should be in payload when token is verified', async () => {
        const jwtService = new JwtService('1234');

        // mock uuid generated
        const testUuid = '12345';
        const uuidMock = jest.spyOn(UUID, 'v4')
            .mockReturnValue(testUuid as any);

        const generatedToken = jwtService.generate('1m', { id: '123' });
        const payload = jwtService.verify(generatedToken);

        expect(uuidMock).toHaveBeenCalledTimes(1);
        expect(payload?.jti).toBe(testUuid);
    });

    describe('Workflow', () => {
        test('generated token should be successfully verified and return the payload', async () => {
            const jwtService = new JwtService('1234');

            const testId = '12345fgj';
            const generatedToken = jwtService.generate('1m', { id: testId });

            const tokenVerified = jwtService.verify<{ id: string }>(generatedToken);

            expect(tokenVerified?.id).toBe(testId);
        });
    });
});