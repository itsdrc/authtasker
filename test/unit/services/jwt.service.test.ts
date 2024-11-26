import { faker } from "@faker-js/faker/.";
import { JwtService } from "@root/services/jwt.service";
import jwt from "jsonwebtoken";

describe('JwtService', () => {
    describe('GENERATE', () => {
        test('jwt.sign should be called with: payload, key and expiration time', async () => {
            const testExpiratonTime = faker.number.int().toString();
            const testPrivateKey = faker.food.vegetable();

            // create service with exp time and private key
            const jwtService = new JwtService(testExpiratonTime, testPrivateKey);

            // create a spy and disable implementation
            const signSpy = jest.spyOn(jwt, 'sign')
                .mockImplementation();

            const testPayload = { email: faker.internet.email() };
            jwtService.generate(testPayload);

            expect(signSpy).toHaveBeenCalledWith(
                testPayload,
                testPrivateKey,
                { expiresIn: testExpiratonTime }
            );
        });

        test('should return the token generate by jwt.sign', () => {
            const jwtService = new JwtService('', '');

            // mock sign returned value
            const tokenMock = faker.food.vegetable();
            jest.spyOn(jwt, 'sign')
                .mockReturnValue(tokenMock as any);

            const result = jwtService.generate({});

            expect(result).toBe(tokenMock);
        });
    });

    describe('VERIFY', () => {
        test('jwt.verify should be called with the provided token and private key', async () => {
            const testPrivateKey = faker.food.vegetable();

            // create service with the test private key
            const jwtService = new JwtService('', testPrivateKey);

            // spies and disable implementation
            const verifySpy = jest.spyOn(jwt, 'verify')
                .mockImplementation();

            // call method with a test token
            const testToken = faker.food.description();
            jwtService.verify(testToken);

            expect(verifySpy)
                .toHaveBeenCalledWith(testToken, testPrivateKey);
        });

        test('if jwt.verify throws, should return undefined', async () => {
            const jwtService = new JwtService('', '');

            // mock jwt.verify to throws an error
            jest.spyOn(jwt, 'verify')
                .mockImplementation(() => { throw new Error('') });

            const result = jwtService.verify('');

            expect(result).toBeUndefined();
        });

        test('should return the payload returned by verify', async () => {
            const jwtService = new JwtService('', '');

            // mock jwt.verify returned payload 
            const mockPayload = faker.food.fruit();
            jest.spyOn(jwt, 'verify')
                .mockReturnValue(mockPayload as any);

            const result = jwtService.verify('');

            expect(result).toBe(mockPayload);
        });
    });
});