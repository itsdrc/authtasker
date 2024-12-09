import { handleError } from "@root/common/helpers/handle-error.helper";
import { HttpError } from "@root/rules/errors/http.error";
import { LoggerService } from "@root/services/logger.service";
import { mock, MockProxy } from "jest-mock-extended";

type responseMock = {
    status: (() => responseMock) & jest.Mock;
    json: jest.Mock;
};

describe('Handle error helper', () => {
    let loggerService: MockProxy<LoggerService>;
    let response: responseMock;

    beforeEach(() => {
        loggerService = mock<LoggerService>();
        response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('error is an HttpError', () => {
        test('should response (once) with status code and message', () => {
            const errorMessage = 'test error message';
            const httpError = HttpError.notFound(errorMessage);

            handleError(response as any, httpError, loggerService);

            expect(response.status)
                .toHaveBeenCalledWith(httpError.statusCode);
            expect(response.status)
                .toHaveBeenCalledTimes(1);

            expect(response.json)
                .toHaveBeenCalledTimes(1);
            expect(response.json)
                .toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('error is an Error', () => {
        test('should response (once) with internal server error status code', () => {
            handleError(response as any, new Error(''), loggerService);

            const expectedStatus = 500;

            expect(response.status)
                .toHaveBeenCalledTimes(1);
            expect(response.status)
                .toHaveBeenCalledWith(expectedStatus);
        });

        test('actual error shouldnt be shown', () => {
            const sensibleInfoErrorSample = 'failed to reconnect mongo db on port ...';

            handleError(
                response as any,
                new Error(sensibleInfoErrorSample),
                loggerService
            );
            
            expect(response.json)
                .not.toHaveBeenCalledWith({ error: sensibleInfoErrorSample });
        });

        test('logger error should be called with error message and stack', () => {
            const error = new Error('test error');
            error.stack = 'test stack';

            handleError(
                response as any,
                error,
                loggerService
            );

            expect(loggerService.error)
                .toHaveBeenCalledWith(
                    expect.stringContaining(error.message),
                    error.stack
                );
        });
    });

    describe('if error is unknown', () => {
        test('should response (once) with internal server error status code', () => {
            handleError(response as any, {} as unknown, loggerService);

            const expectedStatus = 500;

            expect(response.status)
                .toHaveBeenCalledTimes(1);
            expect(response.status)
                .toHaveBeenCalledWith(expectedStatus);
        });

        test('actual error shouldnt be shown', () => {
            const sensibleInfoErrorSample = 'failed to reconnect mongo db on port ...';

            handleError(
                response as any,
                sensibleInfoErrorSample as unknown,
                loggerService
            );
            
            expect(response.json)
                .not.toHaveBeenCalledWith({ error: sensibleInfoErrorSample });
        });

        test('logger error should be called with error', () => {
            const unknownError = 'unknown error...';

            handleError(
                response as any,
                unknownError as unknown,
                loggerService
            );

            expect(loggerService.error)
                .toHaveBeenCalledWith(
                    expect.stringContaining(unknownError)
                );
        });
    });
});