import { UserController } from "../../controllers/user.controller";
import { CreateUserValidator } from "../../rules/validators/create-user.validator";
import { UserService } from "../../services/user.service";
import { Request, Response } from "express";
import * as ErrorHandler from "../../controllers/helpers/handle-error.helper";
import { LoginUserValidator } from "../../rules/validators/login-user.validator";
import * as Mocks from "./mocks/user.controller.test.mocks";

describe('UserController', () => {
    let userController: UserController;
    let userService: {
        create: jest.SpyInstance,
        login: jest.SpyInstance,
        validateEmail: jest.SpyInstance,
        findOne: jest.SpyInstance,
        findAll: jest.SpyInstance,
        deleteOne: jest.SpyInstance,
    };

    // res.status(...).json() mock
    let responseJsonMock = jest.fn();

    // res.status(...).send() mock
    let responseSendMock = jest.fn();

    // res.status(...).end() mock
    let responseEndMock = jest.fn();

    // res.status() mock
    let response: { status: jest.SpyInstance };

    let handleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        userService = {
            create: jest.fn().mockResolvedValue(Mocks.createdUser),
            login: jest.fn().mockResolvedValue(Mocks.loggedUser),
            validateEmail: jest.fn(),
            findOne: jest.fn().mockResolvedValue(Mocks.userFound),
            findAll: jest.fn().mockResolvedValue(Mocks.usersFound),
            deleteOne: jest.fn(),
        };
        userController = new UserController(userService as unknown as UserService);

        // fake Response object
        response = {
            status: jest.fn().mockReturnValue({
                json: responseJsonMock,
                send: responseSendMock,
                end: responseEndMock,
            })
        };

        handleErrorSpy = jest.spyOn(ErrorHandler, 'handleError');

        // disables console.error()
        jest.spyOn(console, 'error')
            .mockImplementation(() => {});
    });

    describe('create', () => {
        let validateAndTransformMock: jest.SpyInstance;

        beforeEach(() => {
            // always validate the "user"
            validateAndTransformMock = jest.spyOn(CreateUserValidator, 'validateAndTransform')
                .mockImplementation(() => Promise.resolve([undefined, Mocks.validatedUser as unknown as CreateUserValidator]));
        });

        const callCreate = async () => {
            await userController.create(Mocks.request as unknown as Request, response as unknown as Response);
        }

        describe('successful', () => {
            beforeEach(async () => {
                await callCreate();
            });

            describe('validation', () => {
                test('should be called with the user obtained in body', async () => {
                    expect(validateAndTransformMock).toHaveBeenCalledWith(Mocks.user);
                });
            });

            describe('userService.create', () => {
                test('should be called with the validated user', async () => {
                    expect(userService.create).toHaveBeenCalledWith(Mocks.validatedUser);
                });
            });

            describe('response', () => {
                test('should return status 201', async () => {
                    const expectedStatus = 201;
                    expect(response.status).toHaveBeenCalledWith(expectedStatus);
                });

                test('should return created user as json', async () => {
                    expect(responseJsonMock).toHaveBeenCalledWith(Mocks.createdUser);
                });
            });
        });

        describe('failed', () => {
            describe('validation', () => {
                const validationError = ['err1', 'err2'];

                beforeEach(async () => {
                    validateAndTransformMock.mockReturnValue([validationError, undefined]);
                    await callCreate();
                });

                test('should response status 400', async () => {
                    const expectedStatus = 400;
                    expect(response.status).toHaveBeenCalledWith(expectedStatus);
                });

                test('should response the errors as json', async () => {
                    expect(responseJsonMock).toHaveBeenCalledWith({ errors: validationError });
                });
            });

            describe('userService.create', () => {
                const createError = 'create-error-test';

                beforeEach(async () => {
                    userService.create.mockRejectedValue(createError);
                    await callCreate();
                });

                test('handleError should be called with response and the error', async () => {
                    expect(handleErrorSpy).toHaveBeenCalledWith(response, createError);
                });
            });
        });
    });

    describe('login', () => {
        let validateMock: jest.SpyInstance;

        beforeEach(() => {
            // always validate the user for login
            validateMock = jest.spyOn(LoginUserValidator, 'validate')
                .mockImplementation(() => Promise.resolve([undefined, Mocks.validatedUser as unknown as LoginUserValidator]));
        });

        const callLogin = async () => {
            await userController.login(Mocks.request as unknown as Request, response as unknown as Response);
        }

        describe('successful', () => {
            beforeEach(async () => {
                await callLogin();
            });

            describe('validation', () => {
                test('should be called with the user obtained body', async () => {
                    expect(validateMock).toHaveBeenCalledWith(Mocks.user);
                });
            });

            describe('userService.login', () => {
                test('should be called with the validated user', async () => {
                    expect(userService.login).toHaveBeenCalledWith(Mocks.validatedUser);
                });
            });

            describe('response', () => {
                test('should return status 200', async () => {
                    const expectedStatus = 200;
                    expect(response.status).toHaveBeenCalledWith(expectedStatus);
                });

                test('should return logged user as json', async () => {
                    expect(responseJsonMock).toHaveBeenCalledWith(Mocks.loggedUser);
                });
            });
        });

        describe('failed', () => {
            describe('validation', () => {
                const validationError = ['err1', 'err2'];

                beforeEach(async () => {
                    validateMock.mockReturnValue([validationError, undefined]);
                    await callLogin();
                });

                test('should response status 400', async () => {
                    const expectedStatus = 400;
                    expect(response.status).toHaveBeenCalledWith(expectedStatus);
                });

                test('should response the errors as json', async () => {
                    expect(responseJsonMock).toHaveBeenCalledWith({ errors: validationError });
                });
            });

            describe('userService.login', () => {
                const loginError = 'login-error-test';

                beforeEach(async () => {
                    userService.login.mockRejectedValue(loginError);
                    await callLogin();
                });

                test('handleError should be called with response and the error thrown', async () => {
                    expect(handleErrorSpy).toHaveBeenCalledWith(response, loginError);
                });
            });
        });
    });

    describe('validateEmail', () => {
        const callValidateEmail = async () => {
            await userController.validateEmail(Mocks.request as unknown as Request, response as unknown as Response);
        }

        describe('succesful', () => {
            beforeEach(async () => {
                await callValidateEmail();
            });

            describe('userService.validateEmail', () => {
                test('validateEmail should be called with the token obtained from req.params.token', async () => {
                    expect(userService.validateEmail).toHaveBeenCalledWith(Mocks.token);
                });
            });

            describe('response', () => {
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
        });

        describe('failed', () => {
            describe('userService.validateEmail', () => {
                const validateEmailError = 'validate-email-error-test';

                beforeEach(async () => {
                    userService.validateEmail.mockRejectedValue(validateEmailError);
                    await callValidateEmail();
                });

                test('handleError should be called with response and the error thrown', async () => {
                    expect(handleErrorSpy).toHaveBeenCalledWith(response, validateEmailError);
                });
            });
        });
    });

    describe('findOne', () => {
        const callFindOne = async () => {
            await userController.findOne(Mocks.request as unknown as Request, response as unknown as Response);
        }

        describe('successful', () => {
            beforeEach(async () => {
                await callFindOne();
            });

            describe('userService.findOne', () => {
                test('should be called with the id obtained from req.params.id', async () => {
                    expect(userService.findOne).toHaveBeenCalledWith(Mocks.id);
                });
            });

            describe('response', () => {
                test('should return status 200', async () => {
                    const expectedStatus = 200;
                    expect(response.status).toHaveBeenCalledWith(expectedStatus);
                });

                test('should return the user found as json', async () => {
                    expect(responseJsonMock).toHaveBeenCalledWith(Mocks.userFound);
                });
            });
        });

        describe('failed', () => {
            describe('userService.findOne', () => {
                const findOneError = 'find-one-error-test';

                beforeEach(async () => {
                    userService.findOne.mockRejectedValue(findOneError);
                    await callFindOne();
                });

                test('handleError should be called with response and the error thrown', async () => {
                    expect(handleErrorSpy).toHaveBeenCalledWith(response, findOneError);
                });
            });
        });
    });

    describe('findAll', () => {
        const callFindAll = async () => {
            await userController.findAll(Mocks.request as unknown as Request, response as unknown as Response);
        };

        describe('successful', () => {
            beforeEach(async () => {
                await callFindAll();
            });

            describe('userService.findAll', () => {
                test('should be called with limit and page found in req.query as numbers', async () => {
                    expect(userService.findAll).toHaveBeenCalledWith(parseInt(Mocks.limit), parseInt(Mocks.page));
                });
            });

            describe('response', () => {
                test('should return the users found as json', async () => {
                    expect(responseJsonMock).toHaveBeenCalledWith(Mocks.usersFound);
                });

                test('should return status 200', async () => {
                    const expectedStatus = 200;
                    expect(response.status).toHaveBeenCalledWith(expectedStatus);
                });
            });
        });

        describe('failed', () => {
            describe('userService.findAll', () => {
                const findAllError = 'test-error';

                beforeEach(async () => {
                    userService.findAll.mockRejectedValue(findAllError);
                    await callFindAll();
                });

                test('handleError should be called with response and the error thrown', async () => {
                    expect(handleErrorSpy).toHaveBeenCalledWith(response, findAllError);
                });
            });
        });
    });

    describe('deleteOne', () => {
        const callDeleteOne = async () => {
            await userController.deleteOne(Mocks.request as unknown as Request, response as unknown as Response);
        };

        describe('sucessful', () => {
            beforeEach(async () => {
                await callDeleteOne();
            });

            describe('userService.deleteOne', () => {
                test('should be called with the id found in req.params.id', async () => {
                    expect(userService.deleteOne).toHaveBeenCalledWith(Mocks.id);
                });
            });

            describe('response', () => {
                test('should return status 204', async () => {
                    const expectedStatus = 204;
                    expect(response.status).toHaveBeenCalledWith(expectedStatus);
                });

                test('should ending the response after set the status', async () => {
                    expect(responseEndMock).toHaveBeenCalledTimes(1);
                });
            });
        });

        describe('failed', () => {
            describe('userService.deleteOne', () => {
                const findOneError = 'test-error';

                beforeEach(async () => {
                    userService.deleteOne.mockRejectedValue(findOneError);
                    await callDeleteOne();
                });

                test('handleError should be called with response and the error thrown', async () => {
                    expect(handleErrorSpy).toHaveBeenCalledWith(response, findOneError);
                });
            });
        });
    });
});