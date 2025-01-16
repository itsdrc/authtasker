import { Model, Query } from 'mongoose';
import { mock, MockProxy } from 'jest-mock-extended';
import express, { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import request from 'supertest'

import { JwtBlackListService, JwtService, LoggerService } from '@root/services';
import { IUser } from '@root/interfaces/user/user.interface';
import { FindMockQuery } from '../helpers/types/find-mock-query.type';
import { rolesMiddlewareFactory } from '@root/middlewares/roles.middleware';
import * as MiddlewareHelpers from '@root/middlewares/helpers/can-access.helper';
import { FORBIDDEN_MESSAGE } from '@root/rules/errors/messages/error.messages';
import * as Handlers from '@root/common/helpers/handle-error.helper';
import { TOKEN_PURPOSES } from '@root/rules/constants/token-purposes.constants';

describe('Roles middleware', () => {
    let userModel: FindMockQuery<MockProxy<Model<IUser>>>;
    let loggerService: MockProxy<LoggerService>;
    let jwtBlackListService: MockProxy<JwtBlackListService>;
    const jwtService = new JwtService('12345test');

    const app = express();

    beforeEach(() => {
        userModel = (mock<Model<IUser>>() as any);
        loggerService = mock<LoggerService>();
        jwtBlackListService = mock<JwtBlackListService>();
        userModel.findById.mockReturnValue(mock<Query<any, any>>());
    });

    describe('Token not provided', () => {
        test('should return 401 UNAUTHORIZED, "No token provided"', async () => {
            // test endpoint
            const endpoint = `/test/${uuidv4()}/readonly`;
            const expectedStatus = 401;
            const expectedMessage = 'No token provided';

            const middleware = rolesMiddlewareFactory(
                'readonly',
                userModel as unknown as Model<IUser>,
                loggerService,
                jwtService,
                jwtBlackListService
            );

            app.get(endpoint, middleware, (req, res) => {
                res.status(204).end();
            });

            const response = await request(app)
                .get(endpoint)

            expect(response.statusCode).toBe(expectedStatus);
            expect(response.body.error).toBe(expectedMessage);
        });
    });

    describe('Token is not valid', () => {
        test('should return 401 UNAUTHORIZED, "Invalid bearer token"', async () => {
            // test endpoint
            const endpoint = `/test/${uuidv4()}/readonly`;
            const expectedStatus = 401;
            const expectedMessage = 'Invalid bearer token';

            const middleware = rolesMiddlewareFactory(
                'readonly',
                userModel as unknown as Model<IUser>,
                loggerService,
                jwtService,
                jwtBlackListService
            );

            app.get(endpoint, middleware, (req, res) => {
                res.status(204).end();
            });

            // generate a valid token
            const invalidToken = '12345';

            const response = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${invalidToken}`);

            expect(response.statusCode).toBe(expectedStatus);
            expect(response.body.error).toBe(expectedMessage);
        });
    });

    describe('User in token not found', () => {
        test('should return 401 UNAUTHORIZED, "User not found"', async () => {
            // test endpoint
            const endpoint = `/test/${uuidv4()}/readonly`;
            const expectedStatus = 401;
            const expectedMessage = 'Invalid bearer token';

            // mock user not found
            userModel
                .findById()
                .exec
                .mockResolvedValue(null);

            const middleware = rolesMiddlewareFactory(
                'readonly',
                userModel as unknown as Model<IUser>,
                loggerService,
                jwtService,
                jwtBlackListService
            );

            app.get(endpoint, middleware, (req, res) => {
                res.status(204).end();
            });

            // generate a valid token
            const validToken = jwtService.generate('1m', {
                id: '12345',
                purpose: TOKEN_PURPOSES.SESSION,
            });

            // stub blacklist
            jwtBlackListService.isBlacklisted
                .mockResolvedValue(false);

            const response = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.statusCode).toBe(expectedStatus);
            expect(response.body.error).toBe(expectedMessage);
        });
    });

    describe('Token purpose is not the expected', () => {
        test('should return 401 UNAUTHORIZED, "Invalid bearer token"', async () => {
            // test endpoint
            const endpoint = `/test/${uuidv4()}/readonly`;
            const expectedStatus = 401;
            const expectedMessage = 'Invalid bearer token';

            const middleware = rolesMiddlewareFactory(
                'readonly',
                userModel as unknown as Model<IUser>,
                loggerService,
                jwtService,
                jwtBlackListService
            );

            app.get(endpoint, middleware, (req, res) => {
                res.status(204).end();
            });

            // generate a valid token but purpose is not the expected
            const validToken = jwtService.generate('1m', {
                id: '12345',
                purpose: TOKEN_PURPOSES.EMAIL_VALIDATION,
            });

            // stub blacklist
            jwtBlackListService.isBlacklisted
                .mockResolvedValue(false);

            const response = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.statusCode).toBe(expectedStatus);
            expect(response.body.error).toBe(expectedMessage);
        });
    });

    describe('User id not in token', () => {
        test('should return 401 UNAUTHORIZED, "Invalid bearer token"', async () => {
            // test endpoint
            const endpoint = `/test/${uuidv4()}/readonly`;
            const expectedStatus = 401;
            const expectedMessage = 'Invalid bearer token';

            const middleware = rolesMiddlewareFactory(
                'readonly',
                userModel as unknown as Model<IUser>,
                loggerService,
                jwtService,
                jwtBlackListService
            );

            app.get(endpoint, middleware, (req, res) => {
                res.status(204).end();
            });

            // generate a valid token with no user id
            const validToken = jwtService.generate('1m', {                
                purpose: TOKEN_PURPOSES.SESSION,
            });

            // stub blacklist
            jwtBlackListService.isBlacklisted
                .mockResolvedValue(false);

            const response = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.statusCode).toBe(expectedStatus);
            expect(response.body.error).toBe(expectedMessage);
        });
    });

    describe('Token is blacklisted', () => {
        test('should return 401 UNAUTHORIZED, "Invalid bearer token"', async () => {
            // test endpoint
            const endpoint = `/test/${uuidv4()}/readonly`;
            const expectedStatus = 401;
            const expectedMessage = 'Invalid bearer token';

            const middleware = rolesMiddlewareFactory(
                'readonly',
                userModel as unknown as Model<IUser>,
                loggerService,
                jwtService,
                jwtBlackListService
            );

            app.get(endpoint, middleware, (req, res) => {
                res.status(204).end();
            });

            // generate a valid token
            const validToken = jwtService.generate('1m', {
                id: '12345',
                purpose: TOKEN_PURPOSES.SESSION,
            });

            // mock blacklist
            jwtBlackListService.isBlacklisted
                .mockResolvedValue(true);

            const response = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.statusCode).toBe(expectedStatus);
            expect(response.body.error).toBe(expectedMessage);
        });
    });

    describe('canAccess helper returns false (role does not have permission to access)', () => {
        test('should return 401 UNAUTHORIZED, forbidden message', async () => {
            // test endpoint
            const endpoint = `/test/${uuidv4()}/readonly`;
            const expectedStatus = 403;
            const expectedMessage = FORBIDDEN_MESSAGE;

            const middleware = rolesMiddlewareFactory(
                'readonly',
                userModel as unknown as Model<IUser>,
                loggerService,
                jwtService,
                jwtBlackListService
            );

            app.get(endpoint, middleware, (req, res) => {
                res.status(204).end();
            });

            // generate a valid token
            const validToken = jwtService.generate('1m', {
                id: '12345',
                purpose: TOKEN_PURPOSES.SESSION,
            });

            // stub blacklist 
            jwtBlackListService.isBlacklisted
                .mockResolvedValue(false);

            // stub user found
            userModel
                .findById()
                .exec
                .mockResolvedValue({} as any);

            // mock canAccess helper
            const canAccessHelperMock = jest.spyOn(MiddlewareHelpers, 'canAccess')
                .mockReturnValue(false);

            const response = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${validToken}`);

            expect(canAccessHelperMock).toHaveBeenCalled();
            expect(response.statusCode).toBe(expectedStatus);
            expect(response.body.error).toBe(expectedMessage);
        });
    });

    describe('Operation success', () => {
        test('request should contain userId and userRole', async () => {
            const middleware = rolesMiddlewareFactory(
                'readonly',
                userModel as unknown as Model<IUser>,
                loggerService,
                jwtService,
                jwtBlackListService
            );

            const requestMock = mock<Request>();
            const responseMock = mock<Response>();

            // stub token provided
            requestMock.header.mockReturnValue('something');

            // stub res.status().json();
            responseMock.status.mockReturnThis();

            // stub token verification
            const requestUserId = 'test-id-123';
            const tokenVerificationMock = jest.spyOn(jwtService, 'verify')
                .mockReturnValue({
                    id: requestUserId,
                    purpose: TOKEN_PURPOSES.SESSION,
                } as any);

            // stub blacklist
            jwtBlackListService.isBlacklisted
                .mockResolvedValue(false);

            // mock user found, obviously, the same as in the token payload
            const userFound = {
                id: requestUserId,
                role: 'editor'
            };

            userModel
                .findById()
                .exec
                .mockResolvedValue(userFound);

            // mock canAccess helper
            const canAccessHelperMock = jest.spyOn(MiddlewareHelpers, 'canAccess')
                .mockReturnValue(true);

            await middleware(
                requestMock,
                responseMock,
                jest.fn()
            );

            expect(tokenVerificationMock).toHaveBeenCalled();
            expect(canAccessHelperMock).toHaveBeenCalled();
            expect((requestMock as any).userId).toBe(userFound.id);
            expect((requestMock as any).userRole).toBe(userFound.role);
        });

        test('Express.next() should be called', async () => {
            const middleware = rolesMiddlewareFactory(
                'readonly',
                userModel as unknown as Model<IUser>,
                loggerService,
                jwtService,
                jwtBlackListService
            );

            const requestMock = mock<Request>();
            const responseMock = mock<Response>();
            const nextFunctionMock = jest.fn();

            // stub token provided
            requestMock.header.mockReturnValue('something');

            // stub res.status().json();
            responseMock.status.mockReturnThis();

            // stub token verification
            const tokenVerificationMock = jest.spyOn(jwtService, 'verify')
                .mockReturnValue({
                    id: '123',
                    purpose: TOKEN_PURPOSES.SESSION,
                } as any);

            // stub user found
            userModel
                .findById()
                .exec
                .mockResolvedValue({} as any);

            // stub blacklist
            jwtBlackListService.isBlacklisted
                .mockResolvedValue(false);

            // mock canAccess helper
            const canAccessHelperMock = jest.spyOn(MiddlewareHelpers, 'canAccess')
                .mockReturnValue(true);

            await middleware(
                requestMock,
                responseMock,
                nextFunctionMock
            );

            expect(tokenVerificationMock).toHaveBeenCalled();
            expect(canAccessHelperMock).toHaveBeenCalled();
            expect(nextFunctionMock).toHaveBeenCalled();
        });
    });

    describe('An unexpected error occurs', () => {
        test('handleError helper should be called', async () => {
            const handleErrorHelperSpy = jest.spyOn(Handlers, 'handleError')
                .mockImplementation();

            const middleware = rolesMiddlewareFactory(
                'readonly',
                userModel as unknown as Model<IUser>,
                loggerService,
                jwtService,
                jwtBlackListService
            );

            const requestMock = mock<Request>();
            const responseMock = mock<Response>();
            const nextFunctionMock = jest.fn();

            // stub token provided
            requestMock.header.mockReturnValue('something');

            // stub res.status().json();
            responseMock.status.mockReturnThis();

            // stub token verification
            jest.spyOn(jwtService, 'verify')
                .mockReturnValue({
                    id: '123',
                    purpose: TOKEN_PURPOSES.SESSION,
                } as any);

            // stub blacklist
            jwtBlackListService.isBlacklisted
                .mockResolvedValue(false);

            // mock findById().exec() to cause an error
            userModel
                .findById()
                .exec
                .mockRejectedValue(new Error('test-error'));

            await middleware(
                requestMock,
                responseMock,
                nextFunctionMock
            );

            expect(handleErrorHelperSpy).toHaveBeenCalled();
        });
    });

    test('jwtBlacklistService.isBlacklisted should be called with jti (in payload)', async () => {
        const middleware = rolesMiddlewareFactory(
            'readonly',
            userModel as unknown as Model<IUser>,
            loggerService,
            jwtService,
            jwtBlackListService
        );

        const requestMock = mock<Request>();
        const responseMock = mock<Response>();
        const nextFunctionMock = jest.fn();

        // stub token provided
        requestMock.header.mockReturnValue('something');

        // stub res.status().json();
        responseMock.status.mockReturnThis();

        // mock token verification
        const testJti = 'test jti';
        jest.spyOn(jwtService, 'verify')
            .mockReturnValue({
                id: '123',
                purpose: TOKEN_PURPOSES.SESSION,
                jti: testJti
            } as any);

        // stub blacklist
        jwtBlackListService.isBlacklisted
            .mockResolvedValue(false);

        // stub findById().exec()
        userModel
            .findById()
            .exec
            .mockResolvedValue({});

        await middleware(
            requestMock,
            responseMock,
            nextFunctionMock
        );

        expect(jwtBlackListService.isBlacklisted)
            .toHaveBeenCalledWith(testJti);
    });
});