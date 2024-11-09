import { UserController } from "../../controllers/user.controller";
import { CreateUserValidator } from "../../rules/validators/create-user.validator";
import { UserService } from "../../services/user.service";
import { Request, Response } from "express"
import * as ErrorHandler from "../../controllers/helpers/handle-error.helper";
import { LoginUserValidator } from "../../rules/validators/login-user.validator";

describe('UserController', () => {
    let userController: UserController;
    let userService: {
        create: jest.SpyInstance,
        login: jest.SpyInstance,
        validateEmail: jest.SpyInstance,
        findOne: jest.SpyInstance,
    };

    // user expected in body
    const user = 'user-test';
    // user returned by validator
    const validatedUser = 'user-validated-test';
    // user returned by userService.create
    const createdUser = 'user-created-test';
    // user returned by userService.login
    const loggedUser = 'user-logged-test';
    // user returned by userService.findOne
    const userFound = 'test-user-found';
    // fake token for req.params.token
    const token = '123';
    // fake id for req.params.id
    const id = '123express';

    // res.status(...).json() mock
    let responseJsonMock = jest.fn();

    // res.status(...).send() mock
    let responseSendMock = jest.fn();

    // res.status() mock
    let response: { status: jest.SpyInstance };

    // fake Request object
    const request = {
        body: user,
        params: { token, id },
    } as const;

    let handleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        userService = {
            create: jest.fn().mockResolvedValue(createdUser),
            login: jest.fn().mockResolvedValue(loggedUser),
            validateEmail: jest.fn(),
            findOne: jest.fn().mockResolvedValue(userFound),
        };
        userController = new UserController(userService as unknown as UserService);

        // fake Response object
        response = {
            status: jest.fn().mockReturnValue({
                json: responseJsonMock,
                send: responseSendMock
            })
        };

        handleErrorSpy = jest.spyOn(ErrorHandler, 'handleError');
    });

    describe('create', () => {
        let validateAndTransformMock: jest.SpyInstance;

        beforeEach(() => {
            // always validate the "user"
            validateAndTransformMock = jest.spyOn(CreateUserValidator, 'validateAndTransform')
                .mockImplementation(() => Promise.resolve([undefined, validatedUser as unknown as CreateUserValidator]));
        });

        const callCreate = async () => {
            await userController.create(request as unknown as Request, response as unknown as Response);
        }

        describe('successful', () => {
            test('validateAndTransform should be called with the user obtained in body', async () => {
                await callCreate();
                expect(validateAndTransformMock).toHaveBeenCalledWith(user);
            });

            test('create should be called with the validated user', async () => {
                await callCreate();
                expect(userService.create).toHaveBeenCalledWith(validatedUser);
            });

            test('should response status 201', async () => {
                const expectedStatus = 201;
                await callCreate();
                expect(response.status).toHaveBeenCalledWith(expectedStatus);
            });

            test('should response the created user as json', async () => {
                await callCreate();
                expect(responseJsonMock).toHaveBeenCalledWith(createdUser);
            });
        });

        describe('failed', () => {
            test('should response status 400 if validation fails', async () => {
                const expectedStatus = 400;
                validateAndTransformMock.mockReturnValue([[], undefined]);
                await callCreate();
                expect(response.status).toHaveBeenCalledWith(expectedStatus);
            });

            test('should response the errors as json if validator fails', async () => {
                const errorsExpected = ['err1', 'err2'];
                validateAndTransformMock.mockReturnValue([errorsExpected, undefined]);
                await callCreate();
                expect(responseJsonMock).toHaveBeenCalledWith({ errors: errorsExpected });
            });

            test('handleError should be called with response and error if create fails', async () => {
                const error = 'test-error';
                userService.create.mockRejectedValue(error);
                await callCreate();
                expect(handleErrorSpy).toHaveBeenCalledWith(response, error);
            });
        });
    });

    describe('login', () => {
        let validateMock: jest.SpyInstance;

        const callLogin = async () => {
            await userController.login(request as unknown as Request, response as unknown as Response);
        }

        beforeEach(() => {
            validateMock = jest.spyOn(LoginUserValidator, 'validate')
                .mockImplementation(() => Promise.resolve([undefined, validatedUser as unknown as LoginUserValidator]));
        });

        describe('successful', () => {
            test('validate should be called with the user obtained body', async () => {
                await callLogin();
                expect(validateMock).toHaveBeenCalledWith(user);
            });

            test('login should be called with the validated user', async () => {
                await callLogin();
                expect(userService.login).toHaveBeenCalledWith(validatedUser);
            });

            test('should response status 200', async () => {
                const expectedStatus = 200;
                await callLogin();
                expect(response.status).toHaveBeenCalledWith(expectedStatus);
            });

            test('should response the logged user as json', async () => {
                await callLogin();
                expect(responseJsonMock).toHaveBeenCalledWith(loggedUser);
            });
        });

        describe('failed', () => {
            test('should response status 400 if validation fails', async () => {
                const expectedStatus = 400;
                validateMock.mockReturnValue([[], undefined]);
                await callLogin();
                expect(response.status).toHaveBeenCalledWith(expectedStatus);
            });

            test('should response the errors as json if validator fails', async () => {
                const errorsExpected = ['err1', 'err2'];
                validateMock.mockReturnValue([errorsExpected, undefined]);
                await callLogin();
                expect(responseJsonMock).toHaveBeenCalledWith({ errors: errorsExpected });
            });

            test('handleError should be called with response and error if login fails', async () => {
                const error = 'test-error';
                userService.login.mockRejectedValue(error);
                await callLogin();
                expect(handleErrorSpy).toHaveBeenCalledWith(response, error);
            });
        });
    });

    describe('validateEmail', () => {
        const callValidateEmail = async () => {
            await userController.validateEmail(request as unknown as Request, response as unknown as Response);
        }

        describe('succesful', () => {
            test('validateEmail should be called with the token obtained from req.params.token', async () => {
                await callValidateEmail();
                expect(userService.validateEmail).toHaveBeenCalledWith(token);
            });

            test('should return status 200', async () => {
                const expectedStatus = 200;
                await callValidateEmail();
                expect(response.status).toHaveBeenCalledWith(expectedStatus);
            });

            test('should response a message', async () => {
                const message = 'Email validated';
                await callValidateEmail();
                expect(responseSendMock).toHaveBeenCalledWith(message);
            });
        });

        describe('failed', () => {
            test('handleError should be called with response and error if validateEmail fails', async () => {
                const error = 'test-error';
                userService.validateEmail.mockRejectedValue(error);
                await callValidateEmail();
                expect(handleErrorSpy).toHaveBeenCalledWith(response, error);
            });
        });
    });

    describe('findOne', () => {
        const callFindOne = async () => {
            await userController.findOne(request as unknown as Request, response as unknown as Response);
        }

        describe('successful', () => {
            test('findOne should be called with the id obtained from req.params.id', async () => {
                await callFindOne();
                expect(userService.findOne).toHaveBeenCalledWith(id);
            });

            test('should response the user found as json', async () => {
                await callFindOne();
                expect(responseJsonMock).toHaveBeenCalledWith(userFound);
            });

            test('should response status 200', async () => {
                const expectedStatus = 200;
                await callFindOne();
                expect(response.status).toHaveBeenCalledWith(expectedStatus);
            });
        });

        describe('failed', () => {
            test('handleError should be called with response and error if findOne fails', async () => {
                const error = 'test-error';
                userService.findOne.mockRejectedValue(error);
                await callFindOne();
                expect(handleErrorSpy).toHaveBeenCalledWith(response, error);
            });
        });
    });
});