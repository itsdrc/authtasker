import { faker } from "@faker-js/faker/.";
import * as UUid from 'uuid';
import { requestContextMiddlewareFactory } from "@root/middlewares/common/request-context.middleware";
import { RequestLog } from "@root/types/logs/request.log.type";
import * as ErrorHandler  from "@root/common/helpers/handle-error.helper";

describe('request context middleware', () => {
    test('should set the request id in Request-Id header', async () => {
        // --- mock injections ---        
        const loggerServiceMock = {
            info: jest.fn(),
        };

        const asyncLocalStorageMock = {
            run: jest.fn()
        };

        // --- mock middleware arguments ---
        const nextMock = jest.fn();

        const requestMock = {} as unknown as Request;

        const responseMock = {
            setHeader: jest.fn(),
            on: jest.fn()
        };

        // --- mock id generation ---
        const requestIdMock = faker.food.vegetable();
        jest.spyOn(UUid, 'v4').mockReturnValue(requestIdMock as any);

        // stub error handler
        jest.spyOn(ErrorHandler, 'handleError').mockImplementation();

        // create middleware
        const middleware = requestContextMiddlewareFactory(
            asyncLocalStorageMock as any,
            loggerServiceMock as any,
        );

        // execute
        middleware(
            requestMock as any,
            responseMock as any,
            nextMock as any,
        );

        expect(responseMock.setHeader)
            .toHaveBeenCalledWith("Request-Id", requestIdMock)
    });

    test('asyncLocalStorage.run should be called with the store data (url, method, requestId)', () => {
        // --- mock injections ---
        const loggerServiceMock = {
            info: jest.fn(),
        };

        const asyncLocalStorageMock = {
            run: jest.fn()
        };

        // --- mock middleware arguments ---
        const nextMock = jest.fn();

        const responseMock = {
            setHeader: jest.fn(),
            on: jest.fn()
        };

        const requestMock = {
            originalUrl: faker.internet.url(),
            method: faker.food.vegetable(),
        };

        // stub error handler
        jest.spyOn(ErrorHandler, 'handleError').mockImplementation();

        // create middleware
        const middleware = requestContextMiddlewareFactory(
            asyncLocalStorageMock as any,
            loggerServiceMock as any,
        );

        // mock id generation
        const requestIdMock = faker.food.vegetable();
        jest.spyOn(UUid, 'v4').mockReturnValue(requestIdMock as any);

        // execute
        middleware(
            requestMock as any,
            responseMock as any,
            nextMock as any,
        );

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
        // --- mock injections ---
        const loggerServiceMock = {
            info: jest.fn()
        };

        const asyncLocalStorageMock = {
            run: jest.fn((store, callback) => {
                callback(); // called immediately
            }),
        };

        // --- mock middleware arguments ---
        const nextMock = jest.fn();

        const requestMock = {};

        const responseMock = {
            setHeader: jest.fn(),
            on: jest.fn()
        };

        // stub error handler
        jest.spyOn(ErrorHandler, 'handleError').mockImplementation();

        // create middleware
        const middleware = requestContextMiddlewareFactory(
            asyncLocalStorageMock as any,
            loggerServiceMock as any,
        );

        // execute
        middleware(
            requestMock as any,
            responseMock as any,
            nextMock as any,
        );

        expect(nextMock).toHaveBeenCalledTimes(1);
    });

    test('logger service should be called when request finishes with req data', () => {
        // --- mock injections ---
        const loggerServiceMock = {
            info: jest.fn(),
            logRequest: jest.fn(),
        };

        const asyncLocalStorageMock = {
            run: jest.fn(),
        };

        // --- mock middleware arguments ---
        const nextMock = jest.fn();

        const requestMock = {
            originalUrl: faker.internet.url(),
            method: faker.food.vegetable(),
            ip: faker.internet.ip(),
        };

        const responseMock = {
            setHeader: jest.fn(),
            on: jest.fn((event, callback) => {
                callback(); // executed immediately
            }),
            statusCode: faker.internet.httpStatusCode(),
        };

        // mock id generation
        const requestIdMock = faker.food.vegetable();
        jest.spyOn(UUid, 'v4').mockReturnValue(requestIdMock as any);

        // create middleware
        const middleware = requestContextMiddlewareFactory(
            asyncLocalStorageMock as any,
            loggerServiceMock as any,
        );

        // stub error handler
        jest.spyOn(ErrorHandler, 'handleError').mockImplementation();

        // execute
        middleware(
            requestMock as any,
            responseMock as any,
            nextMock as any,
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
    
    // TODO: TEST ERROR HANDLING
});