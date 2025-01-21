import { mock } from "jest-mock-extended";
import {Request, Response} from "express";
import { getUserInfoOrHandleError } from "@root/controllers/helpers/get-user-info-or-handle-error.helper";

describe('getUserInfoOrHandleError', () => {    
    describe('User id was not set', () => {
        test('should return internal server error', async () => {
            const expectedStatus = 500;

            const requestMock = mock<Request>();
            const responseMock = mock<Response>();
            // mock res.status(..).json()
            responseMock.status.mockReturnThis();

            (requestMock as any).userRole = 'editor';
            (requestMock as any).userId = undefined;
            (requestMock as any).jti = 'test jti';
            (requestMock as any).tokenExp = undefined;

            getUserInfoOrHandleError(requestMock, responseMock);

            expect(responseMock.status)
                .toHaveBeenCalledWith(expectedStatus);
        });
    });

    describe('User role was not set', () => {
        test('should return internal server error', async () => {
            const expectedStatus = 500;

            const requestMock = mock<Request>();
            const responseMock = mock<Response>();
            // mock res.status(..).json()
            responseMock.status.mockReturnThis();

            (requestMock as any).userRole = undefined;
            (requestMock as any).userId = 'test user id';
            (requestMock as any).jti = 'test jti';
            (requestMock as any).tokenExp = undefined;

            getUserInfoOrHandleError(requestMock, responseMock);

            expect(responseMock.status)
                .toHaveBeenCalledWith(expectedStatus);
        });
    });

    describe('jti was not set', () => {
        test('should return internal server error', async () => {
            const expectedStatus = 500;

            const requestMock = mock<Request>();
            const responseMock = mock<Response>();
            // mock res.status(..).json()
            responseMock.status.mockReturnThis();


            (requestMock as any).userRole = 'editor';
            (requestMock as any).userId = 'test user id';
            (requestMock as any).jti = undefined;
            (requestMock as any).tokenExp = undefined;

            getUserInfoOrHandleError(requestMock, responseMock);

            expect(responseMock.status)
                .toHaveBeenCalledWith(expectedStatus);
        });
    });

    describe('tokenExp was not set', () => {
        test('should return internal server error', async () => {
            const expectedStatus = 500;

            const requestMock = mock<Request>();
            const responseMock = mock<Response>();
            // mock res.status(..).json()
            responseMock.status.mockReturnThis();

            (requestMock as any).userRole = 'editor';
            (requestMock as any).userId = 'test user id';
            (requestMock as any).jti = 'test jti';
            (requestMock as any).tokenExp = undefined;

            getUserInfoOrHandleError(requestMock, responseMock);

            expect(responseMock.status)
                .toHaveBeenCalledWith(expectedStatus);
        });
    });
});