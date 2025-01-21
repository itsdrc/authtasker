import { faker } from '@faker-js/faker/.';
import * as Handlers from '@root/common/handlers/error.handler';
import * as ControllerHelpers from '@root/controllers/helpers/get-user-info-or-handle-error.helper';
import { UserController } from '@root/controllers/user.controller';
import { CreateUserValidator, LoginUserValidator } from '@root/rules/validators/models/user';
import { UpdateUserValidator } from '@root/rules/validators/models/user/update-user.validator';
import { LoggerService, UserService } from '@root/services';
import { SystemLoggerService } from '@root/services/system-logger.service';
import { Request, Response } from 'express';
import { mock, MockProxy } from 'jest-mock-extended';

describe('User Controller', () => {
    let userController: UserController;
    let userService: MockProxy<UserService>;
    let loggerService: MockProxy<LoggerService>;

    beforeEach(() => {
        userService = mock<UserService>();
        loggerService = mock<LoggerService>();
        userController = new UserController(userService, loggerService);

        jest.spyOn(SystemLoggerService, 'error').mockImplementation();
        jest.spyOn(SystemLoggerService, 'info').mockImplementation();
        jest.spyOn(SystemLoggerService, 'warn').mockImplementation();
    });

    describe('create', () => {
        describe('CreatUserValidator.validateAndTransform throws an error', () => {
            test('handleError should be called', async () => {
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                // mock res.status(..).json()
                responseMock.status.mockReturnThis();

                // mock validateAndTransform
                const error = new Error(faker.food.vegetable());
                const validateAndTransformMock = jest.spyOn(CreateUserValidator, 'validateAndTransform')
                    .mockRejectedValue(error);

                await userController.create(requestMock, responseMock);

                expect(validateAndTransformMock).toHaveBeenCalledTimes(1);
                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });

        describe('userService.create throws an error', () => {
            test('handleError should be called', async () => {
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                // mock res.status(..).json()
                responseMock.status.mockReturnThis();

                // stub CreateUserValidator.validateAndTransform
                jest.spyOn(CreateUserValidator, 'validateAndTransform')
                    .mockResolvedValue([undefined, {} as any]);

                // mock userService.create
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
    });

    describe('login', () => {
        describe('LoginUserValidator.validate throws an error', () => {
            test('handleError should be called', async () => {
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                // mock res.status(..).json()
                responseMock.status.mockReturnThis();

                // mock LoginUserValidator.validate
                const error = new Error(faker.food.vegetable());
                const validateMock = jest.spyOn(LoginUserValidator, 'validate')
                    .mockRejectedValue(error);

                await userController.login(requestMock, responseMock);

                expect(validateMock).toHaveBeenCalledTimes(1);
                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });

        describe('userService.login throws an error', () => {
            test('handleError should be called', async () => {
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                // mock res.status(..).json()
                responseMock.status.mockReturnThis();

                // stub LoginUserValidator.validate
                jest.spyOn(LoginUserValidator, 'validate')
                    .mockResolvedValue([undefined, {} as any]);

                // mock userService.login
                const error = new Error(faker.food.vegetable());
                userService.login
                    .mockRejectedValue(error);

                await userController.login(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });
    });

    describe('logout', () => {
        describe('userService.logout throws an error', () => {
            test('handleError should be called', async () => {
                const handleErrorMock = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                // mock res.status(..).json()
                responseMock.status.mockReturnThis();

                const error = new Error(faker.food.vegetable());
                userService.logout.mockRejectedValue(error);

                await userController.logout(requestMock, responseMock);

                expect(handleErrorMock).toHaveBeenCalled();
            });
        });

        describe('getUserInfoOrHandleError returns the expected information', () => {
            test('userService.logout should be called with jti and token expiration', async () => {
                const testJti = 'test-jti';
                const testTokenExpiration = 9890284;

                const getUserInfoOrHandleErrorMock = jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue({
                        jti: testJti,
                        tokenExp: testTokenExpiration,
                        id: '123',
                        role: 'editor',
                    });

                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                // mock res.status(..).json()
                responseMock.status.mockReturnThis();

                await userController.logout(requestMock, responseMock);

                expect(getUserInfoOrHandleErrorMock).toHaveBeenCalledTimes(1);
                expect(userService.logout).toHaveBeenCalledWith(testJti, testTokenExpiration);
            });
        });
    });

    describe('requestEmailValidation', () => {
        describe('userService.requestEmailValidation throws an error', () => {
            test('handleError should be called', async () => {
                const handleErrorMock = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                // mock res.status(..).json()
                responseMock.status.mockReturnThis();

                // mock userService.requestEmailValidation
                const error = new Error(faker.food.vegetable());
                userService.requestEmailValidation
                    .mockRejectedValue(error);

                await userController.requestEmailValidation(requestMock, responseMock);

                expect(handleErrorMock).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });
    });

    describe('confirmEmailValidation', () => {
        describe('userService.confirmEmailValidation throws an error', () => {
            test('handleError should be called', async () => {
                const handleErrorMock = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                // mock res.status(..).json()
                responseMock.status.mockReturnThis();

                // mock userService.confirmEmailValidation
                const error = new Error(faker.food.vegetable());
                userService.confirmEmailValidation.mockRejectedValue(error);

                await userController.confirmEmailValidation(requestMock, responseMock);

                expect(handleErrorMock).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });
    });

    describe('findOne', () => {
        describe('userService.findOne throws an error', () => {
            test('handleError should be called', async () => {
                const handleErrorMock = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                // mock res.status(..).json()
                responseMock.status.mockReturnThis();

                // mock userService.findOne
                const error = new Error(faker.food.vegetable());
                userService.findOne
                    .mockRejectedValue(error);

                await userController.findOne(requestMock, responseMock);

                expect(handleErrorMock).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });
    });

    describe('findAll', () => {
        describe('userService.findAll throws an error', () => {
            test('handleError should be called', async () => {
                const handleErrorMock = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                // mock res.status(..).json()
                responseMock.status.mockReturnThis();

                // mock userService.findAll
                const error = new Error(faker.food.vegetable());
                userService.findAll
                    .mockRejectedValue(error);

                await userController.findAll(requestMock, responseMock);

                expect(handleErrorMock).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });
    });

    describe('deleteOne', () => {
        describe('userService.deleteOne throws an error', () => {
            test('handleError should be called', async () => {
                const handleErrorMock = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                // mock res.status(..).json()
                responseMock.status.mockReturnThis();

                // mock userService.deleteOne
                const error = new Error(faker.food.vegetable());
                userService.deleteOne
                    .mockRejectedValue(error);

                await userController.deleteOne(requestMock, responseMock);

                expect(handleErrorMock).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });
    });

    describe('updateOne', () => {
        describe('UpdateUserValidator.validateAndTransform throws an error', () => {
            test('handleError should be called', async () => {
                const handleErrorMock = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                // mock res.status(..).json()
                responseMock.status.mockReturnThis();

                // mock UpdateUserValidator.validateAndTransform
                const error = new Error(faker.food.vegetable());
                const validateAndTransformMock = jest.spyOn(UpdateUserValidator, 'validateAndTransform')
                    .mockRejectedValue(error);

                await userController.updateOne(requestMock, responseMock);

                expect(validateAndTransformMock).toHaveBeenCalledTimes(1);
                expect(handleErrorMock).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });

        describe('userService.updateOne throws an error', () => {
            test('handleError should be called', async () => {
                const handleErrorMock = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                // mock res.status(..).json()
                responseMock.status.mockReturnThis();

                // stub UpdateUserValidator.validateAndTransform
                jest.spyOn(UpdateUserValidator, 'validateAndTransform')
                    .mockResolvedValue([undefined, {} as any]);

                // mock userService.updateOne
                const error = new Error(faker.food.vegetable());
                userService.updateOne
                    .mockRejectedValue(error);

                await userController.updateOne(requestMock, responseMock);

                expect(handleErrorMock).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });
    });
});