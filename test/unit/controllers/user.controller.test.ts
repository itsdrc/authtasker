import { Request, Response } from 'express';
import { mock, MockProxy } from 'jest-mock-extended';
import { faker } from '@faker-js/faker/.';
import * as Handlers from '@root/common/handlers/error.handler';
import * as ControllerHelpers from '@root/controllers/handlers/get-user-info.handler';
import { UserController } from '@root/controllers/user.controller';
import { CreateUserValidator, LoginUserValidator } from '@root/rules/validators/models/user';
import { UpdateUserValidator } from '@root/rules/validators/models/user/update-user.validator';
import { LoggerService, UserService } from '@root/services';
import { SystemLoggerService } from '@root/services/system-logger.service';
import { PAGINATION_SETTINGS } from '@root/rules/constants/pagination.constants';

describe('User Controller', () => {
    let userController: UserController;
    let userService: MockProxy<UserService>;
    let loggerService: MockProxy<LoggerService>;

    beforeEach(() => {
        userService = mock<UserService>();
        loggerService = mock<LoggerService>();
        userController = new UserController(userService, loggerService);

        // disable system logs
        jest.spyOn(SystemLoggerService, 'error').mockImplementation();
        jest.spyOn(SystemLoggerService, 'info').mockImplementation();
        jest.spyOn(SystemLoggerService, 'warn').mockImplementation();
    });

    describe('Create', () => {
        describe('Validation function throws an unexpected error', () => {
            test('handleError helper should be called', async () => {
                // spy handleError function and disable implementation
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // mock res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // mock CreateUserValidator.validateAndTransform to return an error
                const testError = new Error(faker.food.vegetable());
                jest.spyOn(CreateUserValidator, 'validateAndTransform')
                    .mockRejectedValue(testError);

                await userController.create(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    testError,
                    loggerService,
                );
            });
        });

        describe('Service function "create" throws an error', () => {
            test('handleError helper should be called', async () => {
                // spy handleError function and disable implementation
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // mock res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // stub CreateUserValidator.validateAndTransform
                jest.spyOn(CreateUserValidator, 'validateAndTransform')
                    .mockResolvedValue([undefined, {} as any]);

                // mock userService.create to return an error
                const error = new Error(faker.food.vegetable());
                userService.create.mockRejectedValue(error);

                await userController.create(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });

        describe('Incoming properties are not valid', () => {
            test('service function "create" should not be called', async () => {
                // mock CreateUserValidator.validateAndTransform
                jest.spyOn(CreateUserValidator, 'validateAndTransform')
                    .mockResolvedValue(['test-error', undefined]);

                // mock res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await userController.create(requestMock, responseMock);

                expect(userService.create).not.toHaveBeenCalled();
            });
        });
    });

    describe('Login', () => {
        describe('Validation function throws an unexpected error', () => {
            test('handleError should be called', async () => {
                // spy handleError function and disable implementation
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // mock LoginUserValidator.validate to return an error
                const error = new Error('test-error');
                jest.spyOn(LoginUserValidator, 'validate')
                    .mockRejectedValue(error);

                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await userController.login(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });

            test('service function "login" should not be called', async () => {
                // mock LoginUserValidator.validate
                jest.spyOn(LoginUserValidator, 'validate')
                    .mockResolvedValue(['test-error', undefined]);

                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await userController.login(requestMock, responseMock);

                expect(userService.login).not.toHaveBeenCalled();
            });
        });

        describe('Service function "login" throws an error', () => {
            test('handleError should be called', async () => {
                // spy handleError function and disable implementation
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // stub LoginUserValidator.validate
                jest.spyOn(LoginUserValidator, 'validate')
                    .mockResolvedValue([undefined, {} as any]);

                // mock userService.login to return an error
                const error = new Error('test-error');
                userService.login.mockRejectedValue(error);

                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await userController.login(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });

        describe('Incoming properties are not valid', () => {
            test('service function "login" should not be called', async () => {
                // mock LoginUserValidator.validate
                jest.spyOn(LoginUserValidator, 'validate')
                    .mockResolvedValue(['test-error', undefined]);

                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await userController.login(requestMock, responseMock);

                expect(userService.login).not.toHaveBeenCalled();
            });
        });
    });

    describe('Logout', () => {
        describe('Helper getUserInfoOrHandleError returns undefined (can not get user data)', () => {
            test('service function "logout" should not be called', async () => {
                // mock getUserInfoOrHandleError to return undefined
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue(undefined);

                // stub res.status(..).end()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();                
                responseMock.status.mockReturnThis();

                await userController.logout(requestMock, responseMock);

                expect(userService.logout).not.toHaveBeenCalled();
            });

            test('should not send a response to client again', async () => {
                // mock getUserInfoOrHandleError to return undefined
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue(undefined);

                // stub res.status(..).end()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await userController.logout(requestMock, responseMock);

                expect(responseMock.status).not.toHaveBeenCalled();
                expect(responseMock.json).not.toHaveBeenCalled();
            });
        });

        describe('Service function "logout" throws an error', () => {
            test('handleError helper should be called', async () => {
                // spy handleError function and disable implementation
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // stub getUserInfoOrHandleError to return something
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue({} as any);

                // mock userService.logout to return an error
                const error = new Error('test-error');
                userService.logout.mockRejectedValue(error);

                // stub res.status(..).end()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await userController.logout(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });
    });

    describe('RequestEmailValidation', () => {
        describe('Helper getUserInfoOrHandleError returns undefined (can not get user data)', () => {
            test('service function "requestEmailValidation" should not be called', async () => {
                // mock getUserInfoOrHandleError to return undefined
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue(undefined);

                // stub res.status(..).end()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await userController.requestEmailValidation(requestMock, responseMock);

                expect(userService.requestEmailValidation).not.toHaveBeenCalled();
            });

            test('should not send a response to client again', async () => {
                // mock getUserInfoOrHandleError to return undefined
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue(undefined);

                // stub res.status(..).end()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await userController.requestEmailValidation(requestMock, responseMock);

                expect(responseMock.status).not.toHaveBeenCalled();
                expect(responseMock.json).not.toHaveBeenCalled();
            });
        });

        describe('Service function "requestEmailValdiation" throws an error', () => {
            test('handleError helper should be called', async () => {
                // spy handleError function and disable implementation
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // stub getUserInfoOrHandleError to return something
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue({} as any);

                // mock userService.requestEmailValidation to return an error
                const error = new Error('test-error');
                userService.requestEmailValidation.mockRejectedValue(error);

                // mock res.status(..).end()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await userController.requestEmailValidation(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });
    });

    describe('ConfirmEmailValidation', () => {
        describe('Token not in params', () => {
            test('Service function "confirmEmailValidation" should not be called', async () => {
                // stub res.status(..).end()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await userController.confirmEmailValidation(requestMock, responseMock);

                expect(userService.confirmEmailValidation).not.toHaveBeenCalled();
            });
        });

        describe('Service function "confirmEmailValidation" throws an error', () => {
            test('handleError helper should throw an error', async () => {
                // spy handleError function and disable implementation
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // stub res.status(..).end() and req.params.token
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();
                requestMock.params.token = '123';

                // mock userService.confirmEmailValidation to return an error
                const error = new Error('test-error');
                userService.confirmEmailValidation
                    .mockRejectedValue(error);

                await userController
                    .confirmEmailValidation(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });
    });

    describe('Find one', () => {
        describe('Service function "findOne" throws an error', () => {
            test('handleError helper should be called', async () => {
                // spy handleError function and disable implementation
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // stub res.status(..).end()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // mock userService.findOne to return an error
                const error = new Error('test-error');
                userService.findOne.mockRejectedValue(error);

                await userController.findOne(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });
    });

    describe('Find all', () => {
        describe('Limit and page not provided', () => {
            test('Service function "findAll" should be called with the default limit and page', async () => {
                // stub res.status(..).end()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await userController.findAll(requestMock, responseMock);

                expect(userService.findAll).toHaveBeenCalledWith(
                    PAGINATION_SETTINGS.DEFAULT_LIMIT,
                    PAGINATION_SETTINGS.DEFAULT_PAGE
                );
            });
        });

        describe('User provides limit and page', () => {
            test('Service function "findAll" should be called with the provided limit and page', async () => {
                // stub res.status(..).end() and req.query.limit, req.query.page
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();
                requestMock.query.limit = '10';
                requestMock.query.page = '2';

                await userController.findAll(requestMock, responseMock);

                expect(userService.findAll).toHaveBeenCalledWith(10, 2);
            });
        });

        describe('Service function "findAll" throws an error', () => {
            test('handleError helper should be called', async () => {
                // spy handleError function and disable implementation
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // stub res.status(..).end()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // mock userService.findAll to return an error
                const error = new Error('test-error');
                userService.findAll.mockRejectedValue(error);

                await userController.findAll(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });
    });

    describe('Delete one', () => {
        describe('Helper getUserInfoOrHandleError returns undefined (can not get user data)', () => {
            test('service function "deleteOne" should not be called', async () => {
                // mock getUserInfoOrHandleError to return undefined
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue(undefined);

                // stub res.status(..).end()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await userController.deleteOne(requestMock, responseMock);

                expect(userService.deleteOne).not.toHaveBeenCalled();
            });

            test('should not send a response to client again', async () => {
                // mock getUserInfoOrHandleError to return undefined
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue(undefined);

                // stub res.status(..).end()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await userController.deleteOne(requestMock, responseMock);

                expect(responseMock.status).not.toHaveBeenCalled();
                expect(responseMock.json).not.toHaveBeenCalled();
            });
        });

        describe('Service function "deleteOne" throws an error', () => {
            test('handleError helper should be called', async () => {
                // spy handleError function and disable implementation
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // stub getUserInfoOrHandleError to return something
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue({} as any);

                // mock userService.deleteOne to return an error
                const error = new Error('test-error');
                userService.deleteOne.mockRejectedValue(error);

                // stub res.status(..).end()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await userController.deleteOne(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });
    });

    describe('Update one', () => {
        describe('Validation function throws an unexpected error', () => {
            test('handleError helper should be called', async () => {
                // spy handleError function and disable implementation
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // mock UpdateUserValidator.validateAndTransform to return an error
                const testError = new Error(faker.food.vegetable());
                jest.spyOn(UpdateUserValidator, 'validateAndTransform')
                    .mockRejectedValue(testError);

                await userController.updateOne(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    testError,
                    loggerService,
                );
            });
        });

        describe('Helper getUserInfoOrHandleError returns undefined (can not get user data)', () => {
            test('service function "updateOne" should not be called', async () => {
                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // stub UpdateUserValidator.validateAndTransform to return a valid object
                jest.spyOn(UpdateUserValidator, 'validateAndTransform')
                    .mockResolvedValue([undefined, {} as any]);

                // mock getUserInfoOrHandleError to return undefined
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue(undefined);

                await userController.updateOne(requestMock, responseMock);

                expect(userService.updateOne).not.toHaveBeenCalled();
            });

            test('should not send a response to client again', async () => {
                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // stub UpdateUserValidator.validateAndTransform to return a valid object
                jest.spyOn(UpdateUserValidator, 'validateAndTransform')
                    .mockResolvedValue([undefined, {} as any]);

                // mock getUserInfoOrHandleError to return undefined
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue(undefined);

                await userController.updateOne(requestMock, responseMock);

                expect(responseMock.status).not.toHaveBeenCalled();
                expect(responseMock.json).not.toHaveBeenCalled();                
            });
        });

        describe('Service function "updateOne" throws an error', () => {
            test('handleError helper should be called', async () => {
                // spy handleError function and disable implementation
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // mock getUserInfoOrHandleError to return a value
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue({} as any);

                // stub UpdateUserValidator.validateAndTransform
                jest.spyOn(UpdateUserValidator, 'validateAndTransform')
                    .mockResolvedValue([undefined, {} as any]);                

                // mock userService.updateOne to return an error
                const error = new Error(faker.food.vegetable());
                userService.updateOne.mockRejectedValue(error);

                await userController.updateOne(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });

        describe('Incoming properties are not valid', () => {
            test('service function "updateOne" should not be called', async () => {
                // mock UpdateUserValidator.validateAndTransform
                jest.spyOn(UpdateUserValidator, 'validateAndTransform')
                    .mockResolvedValue(['test-error', undefined]);     
                    
                // mock getUserInfoOrHandleError to return a value
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue({} as any);

                // mock res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await userController.updateOne(requestMock, responseMock);

                expect(userService.updateOne).not.toHaveBeenCalled();
            });
        });
    });
});