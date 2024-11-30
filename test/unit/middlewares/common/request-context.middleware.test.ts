import { faker } from "@faker-js/faker/.";
import { requestContextMiddlewareFactory } from "@root/middlewares/common/request-context.middleware";
import * as UUid from 'uuid';

describe('request context middleware', () => {
    test('should set the request id in Request-Id header', async () => {
        // getting middleware
        const middleware = requestContextMiddlewareFactory({ run: jest.fn() } as any);

        // mock id generation
        const requestIdMock = faker.food.vegetable();
        jest.spyOn(UUid, 'v4').mockReturnValue(requestIdMock as any);

        // mock response
        const responseMock = {
            setHeader: jest.fn(),
        };

        middleware(
            {} as any,
            responseMock as any,
            jest.fn()
        );

        expect(responseMock.setHeader)
            .toHaveBeenCalledWith("Request-Id", requestIdMock)
    });

    test('asyncLocalStorage.run should be called with the store object', async () => {
        const asyncLocalStorageMock = {
            run: jest.fn()
        };

        // getting middleware
        const middleware = requestContextMiddlewareFactory(asyncLocalStorageMock as any);

        // mock id generation
        const requestIdMock = faker.food.vegetable();
        jest.spyOn(UUid, 'v4').mockReturnValue(requestIdMock as any);

        const storeObjectMock = { requestId: requestIdMock };

        middleware(
            {} as any,
            { setHeader: jest.fn() } as any,
            () => {}
        );

        expect(asyncLocalStorageMock.run)
            .toHaveBeenCalledWith(storeObjectMock, expect.anything());
    });

    test('next function should be called inside the callback passed to asyncLocalStorage.run', async () => {
        const asyncLocalStorageMock = {
            run: jest.fn((store, callback) => {                
                callback();
            }),
        };

        // getting middleware
        const middleware = requestContextMiddlewareFactory(asyncLocalStorageMock as any);

        // mock next function
        const nextMock = jest.fn();

        middleware(
            {} as any,
            { setHeader: jest.fn() } as any,
            nextMock as any
        );

        expect(nextMock)
            .toHaveBeenCalledTimes(1);
    });
});