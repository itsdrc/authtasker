import { faker } from "@faker-js/faker/.";
import * as UUid from 'uuid';
import { requestContextMiddlewareFactory } from "@root/middlewares/request-context.middleware";
import { RequestLog } from "@root/types/logs/request.log.type";
import * as GlobalHelpers from "@root/common/helpers/handle-error.helper";
import { mock, MockProxy } from "jest-mock-extended";
import { LoggerService } from "@root/services/logger.service";
import { AsyncLocalStorage } from "async_hooks";
import { Response } from "express";

describe('request context middleware', () => {
    let loggerServiceMock: MockProxy<LoggerService>;
    let asyncLocalStorageMock: MockProxy<AsyncLocalStorage<unknown>>;
    let responseMock: MockProxy<Response>;
    let requestContextMiddleware: ReturnType<typeof requestContextMiddlewareFactory>;

    beforeEach(() => {
        loggerServiceMock = mock<LoggerService>();
        asyncLocalStorageMock = mock<AsyncLocalStorage<unknown>>();
        responseMock = mock<Response>();
        requestContextMiddleware = requestContextMiddlewareFactory(
            asyncLocalStorageMock,
            loggerServiceMock,
        );
    });

    test('should set the request id in Request-Id header', async () => {
        // request id generation mock
        const requestIdMock = 'generated req id mock';
        jest.spyOn(UUid, 'v4').mockReturnValue(requestIdMock as any);

        // execute
        requestContextMiddleware(
            {} as any, // req stub
            responseMock,
            jest.fn(), // next() stub
        );

        expect(responseMock.setHeader)
            .toHaveBeenCalledWith("Request-Id", requestIdMock)
    });

    test('asyncLocalStorage.run should be called with the store data (url, method, requestId)', () => {
        // request mock
        const requestMock = {
            originalUrl: faker.internet.url(),
            method: faker.internet.httpMethod(),
        };

        // request id generation mock
        const requestIdMock = 'generated req id mock';
        jest.spyOn(UUid, 'v4').mockReturnValue(requestIdMock as any);

        // execute
        requestContextMiddleware(
            requestMock as any,
            responseMock,
            jest.fn(), // next() stub
        )

        const storeExpected = {
            requestId: requestIdMock,
            method: requestMock.method,
            url: requestMock.originalUrl,
        };

        expect(asyncLocalStorageMock.run).toHaveBeenCalledWith(
            storeExpected,
            expect.anything()
        );
    });

    test('next function should be called inside the callback passed to asyncLocalStorage.run', async () => {
        // asyncLocalStorage.run mock (to call the callback immediately)
        asyncLocalStorageMock.run
            .mockImplementation((store: any, callback: any) => {
                callback();
            });

        // next() mock
        const nextMock = jest.fn();

        // execute
        requestContextMiddleware(
            {} as any, // req stub
            responseMock as any,
            nextMock,
        );

        expect(nextMock).toHaveBeenCalledTimes(1);
    });

    test('logger service should be called when request finishes with req data', () => {
        const requestMock = {
            originalUrl: faker.internet.url(),
            method: faker.internet.httpMethod(),
            ip: faker.internet.ip(),
        };

        // response status code mock
        const statusCodeMock = faker.internet.httpStatusCode();
        responseMock.statusCode = statusCodeMock;

        // call the callback immediately
        responseMock.on.mockImplementation(((event: string, callback: any) => {
            callback();
        }) as any);

        // request id generation mock
        const requestIdMock = 'generated req id mock';
        jest.spyOn(UUid, 'v4').mockReturnValue(requestIdMock as any);

        // execute
        requestContextMiddleware(
            requestMock as any,
            responseMock as any,
            jest.fn(), // next() stub
        );

        const logExpected: RequestLog = {
            ip: requestMock.ip,
            method: requestMock.method,
            requestId: requestIdMock,
            responseTime: expect.any(Number),
            statusCode: responseMock.statusCode,
            url: requestMock.originalUrl
        }

        expect(responseMock.on)
            .toHaveBeenCalledWith('finish', expect.anything());
        expect(loggerServiceMock.logRequest)
            .toHaveBeenCalledWith(logExpected);
    });

    describe('if an unexpected error occurs', () => {
        test('handle error helper should be called', () => {
            // error throwing mock
            jest.spyOn(UUid, 'v4').mockImplementation(() => {
                throw new Error();
            });

            // spy and mock
            const handleErrorSpy = jest
                .spyOn(GlobalHelpers, 'handleError')
                .mockImplementation();

            // execute
            requestContextMiddleware(
                {} as any, // req stub
                responseMock as any,
                jest.fn(), // next() stub
            );

            expect(handleErrorSpy).toHaveBeenCalled();
        });
    });
});