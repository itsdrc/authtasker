import { Request, Response } from "express";
import { mock, mockDeep, MockProxy } from "jest-mock-extended";
import { Model, Query } from "mongoose";

import type { User } from "@root/types/user/user.type";
import { JwtService } from "@root/services/jwt.service";
import { LoggerService } from "@root/services/logger.service";
import { rolesMiddlewareFactory } from "@root/middlewares/roles.middleware";
import * as GlobalHelpers from "@root/common/helpers/handle-error.helper";
import * as MiddlewareHelpers from "@root/middlewares/helpers/can-access.helper";
import { FindMockQuery } from "../test-helpers/types";

type UserModelMocked = MockProxy<Model<User>>;

describe('Roles middleware', () => {
    let jwtService: MockProxy<JwtService>;
    let userModel: FindMockQuery<UserModelMocked> & UserModelMocked;
    let loggerService: MockProxy<LoggerService>;
    let requestMock: MockProxy<Request>;
    let responseMock: MockProxy<Response> & Response;    
    let rolesMiddleware: ReturnType<typeof rolesMiddlewareFactory>;

    beforeEach(() => {
        jwtService = mock<JwtService>();
        loggerService = mock<LoggerService>();
        userModel = (mock<Model<User>>() as any);
        requestMock = mock<Request>();
        responseMock = mock<Response>();    
        
        responseMock.status.mockReturnThis();

        userModel.findById.mockReturnValue(mock<Query<any, any>>());    

        rolesMiddleware = rolesMiddlewareFactory(
            'readonly',
            userModel,
            loggerService,
            jwtService
        );
    });

    test('req.header should be called with authorization', async () => {
        // spy res.header function. This is needed because
        // calls are deleted on the next line.
        const reqHeaderMockSpy = jest.spyOn(requestMock, 'header');

        // stub res.header('authorization')
        requestMock.header.mockReturnValue('Bearer ...');

        // stub token verification
        jwtService.verify.mockReturnValue({});

        // stub userModel.findById.exec();
        userModel.findById().exec
            .mockResolvedValue({});

        await rolesMiddleware(
            requestMock,
            responseMock,
            jest.fn() // next()
        );

        expect(reqHeaderMockSpy)
            .toHaveBeenCalledWith('authorization');
    });

    test('token verification should be called with the provided token', async () => {
        // mock res.header('authorization')
        const token = 'myMockToken';
        const auth = `Bearer ${token}`;
        requestMock.header.mockReturnValue(auth);

        await rolesMiddleware(
            requestMock,
            responseMock,
            jest.fn() // next()
        );

        expect(jwtService.verify).toHaveBeenCalledWith(token);
    });

    test('userModel.findById should be called with the id in token', async () => {
        // stub res.header('authorization')
        requestMock.header.mockReturnValue('Bearer ...');

        // mock token verification        
        const payload = { id: 'test user id' };
        jwtService.verify.mockReturnValue(payload);

        await rolesMiddleware(
            requestMock,
            responseMock,
            jest.fn() // next()
        );

        expect(userModel.findById)
            .toHaveBeenCalledWith(payload.id);
    });

    describe('if authorization header is not provided', () => {
        test('should return status 401 and "No token provided" error', async () => {
            // mock res.header('authorization')
            requestMock.header.mockReturnValue(undefined);

            await rolesMiddleware(
                requestMock,
                responseMock,
                jest.fn() // next()
            );

            const expectedStatus = 401;
            const expectedErrMssg = 'No token provided';
            expect(responseMock.status)
                .toHaveBeenCalledWith(expectedStatus);
            expect(responseMock.json)
                .toHaveBeenCalledWith({ error: expectedErrMssg });
        });
    });

    describe('if token is not valid', () => {
        test('should return status 401 and "Invalid bearer token" error', async () => {
            // stub res.header('authorization')
            requestMock.header.mockReturnValue('Bearer ...');

            // mock token verification
            jwtService.verify.mockReturnValue(undefined)

            await rolesMiddleware(
                requestMock,
                responseMock,
                jest.fn() // next()
            );

            const expectedStatus = 401;
            const expectedErrMssg = 'Invalid bearer token'
            expect(responseMock.status)
                .toHaveBeenCalledWith(expectedStatus);
            expect(responseMock.json)
                .toHaveBeenCalledWith({ error: expectedErrMssg })
        });
    });

    describe('if user is not found', () => {
        test('should return status 401 and "User not found" error', async () => {
            // stub res.header('authorization')
            requestMock.header.mockReturnValue('Bearer ...');

            // stub token verification
            jwtService.verify.mockReturnValue({});

            // mock user found
            userModel.findById().exec
                .mockResolvedValue(undefined);

            await rolesMiddleware(
                requestMock,
                responseMock,
                jest.fn() // next()
            );

            const expectedStatus = 401;
            const expectedErrMssg = 'User not found';
            expect(responseMock.status)
                .toHaveBeenCalledWith(expectedStatus);
            expect(responseMock.json)
                .toHaveBeenCalledWith({ error: expectedErrMssg });
        });
    });

    describe('if the role is not allowed', () => {
        test('should return status 401 and "You do not have permission to perform this action" error', async () => {
            // stub res.header('authorization')
            requestMock.header.mockReturnValue('Bearer ...');

            // stub token verification
            jwtService.verify.mockReturnValue({});

            // stub user found
            userModel.findById().exec
                .mockResolvedValue({});

            // mock role validation
            jest.spyOn(MiddlewareHelpers, 'canAccess')
                .mockReturnValue(false);

            await rolesMiddleware(
                requestMock,
                responseMock,
                jest.fn() // next()
            );

            const expectedStatus = 401;
            const expectedErrMssg = 'You do not have permission to perform this action';
            expect(responseMock.status)
                .toHaveBeenCalledWith(expectedStatus);
            expect(responseMock.json)
                .toHaveBeenCalledWith({ error: expectedErrMssg });
        });
    });


    describe('if rol is allowed', () => {
        test('next should be called', async () => {
            // stub res.header('authorization')
            requestMock.header.mockReturnValue('Bearer ...');

            // stub token verification
            jwtService.verify.mockReturnValue({});

            // stub user found
            userModel.findById().exec
                .mockResolvedValue({});

            // mock role validation
            jest.spyOn(MiddlewareHelpers, 'canAccess')
                .mockReturnValue(true);

            const nextMock = jest.fn();

            await rolesMiddleware(
                requestMock,
                responseMock,
                nextMock
            );

            expect(nextMock).toHaveBeenCalled();
        });
    });

    describe('if an unexpected error occurs', () => {
        test('handleError helper should be called', async () => {
            const handleErrorSpy = jest
                .spyOn(GlobalHelpers, 'handleError');

            requestMock.header
                .mockImplementation(() => { throw new Error() });

            await rolesMiddleware(
                requestMock,
                responseMock,
                jest.fn() // next()
            );

            expect(handleErrorSpy).toHaveBeenCalled();
        });
    });
});