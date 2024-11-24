import { faker } from "@faker-js/faker/.";

import { UNEXPECTED_ERROR_MESSAGE } from "@root/controllers/constants/unexpected-error.constant";
import { UserController } from "@root/controllers/user.controller";
import { HttpError } from "@root/rules/errors/http.error";
import { CreateUserValidator, LoginUserValidator } from "@root/rules/validators/models/user";
import { UpdateUserValidator } from "@root/rules/validators/models/user/update-user.validator";
import { UserService } from "@root/services/user.service";
import { Request, Response } from "express";

type ResMock = {
    status: (n: number) => ResMock;
    json: jest.SpyInstance;
    end: jest.SpyInstance;
};

type ReqMock = {
    params: any,
    query: any,
    body: any,
}

type UserServiceMock = {
    create: jest.SpyInstance,
    login: jest.SpyInstance,
    validateEmail: jest.SpyInstance,
    findOne: jest.SpyInstance,
    findAll: jest.SpyInstance,
    deleteOne: jest.SpyInstance,
    updateOne: jest.SpyInstance,
}

describe('UserController', () => {
    let userController: UserController;
    let userServiceMock: UserServiceMock;

    let responseMock: ResMock;
    let requestMock: ReqMock;

    beforeEach(() => {
        // services mocks
        userServiceMock = {
            create: jest.fn(),
            login: jest.fn(),
            validateEmail: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn(),
            deleteOne: jest.fn(),
            updateOne: jest.fn(),
        };
        userController = new UserController(userServiceMock as unknown as UserService);

        // express mocks
        requestMock = {
            params: {},
            query: {},
            body: {},
        };

        responseMock = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            end: jest.fn(),
        };

        // stubs
        CreateUserValidator['validateAndTransform'] = jest.fn()
            .mockResolvedValue([undefined, {}]);
        LoginUserValidator['validate'] = jest.fn()
            .mockResolvedValue([undefined, {}]);
        UpdateUserValidator['validateAndTransform'] = jest.fn()
            .mockResolvedValue([undefined, {}]);

        console['error'] = jest.fn();
    });

    describe('CREATE', () => {
        test('validation function should be called with the data in body', async () => {
            const validationSpy = jest.spyOn(CreateUserValidator, 'validateAndTransform');
            const body = { name: faker.food.vegetable() };
            requestMock.body = body;

            await userController.create(
                requestMock as Request,
                responseMock as unknown as Response,
            );

            expect(validationSpy).toHaveBeenCalledWith(body);
        });

        test('userService.create should be called with the user returned by validator', async () => {
            const userValidated = { name: faker.food.vegetable() };
            jest.spyOn(CreateUserValidator, 'validateAndTransform')
                .mockResolvedValue([undefined, userValidated as any]);

            await userController.create(
                requestMock as Request,
                responseMock as unknown as Response,
            );

            expect(userServiceMock.create)
                .toHaveBeenCalledWith(userValidated);
        });

        describe('if everything success', () => {
            test('should response the created user and ok status code', async () => {
                const created = { name: faker.food.vegetable(), };
                userServiceMock.create.mockResolvedValue(created);

                await userController.create(
                    requestMock as Request,
                    responseMock as unknown as Response,
                );

                const expectedStatus = 201;
                expect(responseMock.status)
                    .toHaveBeenCalledWith(expectedStatus);
                expect(responseMock.json)
                    .toHaveBeenCalledWith(created);
            });
        });

        describe('if validation fails', () => {
            test('should response error and bad request status code', async () => {
                const validationError = faker.animal.cat();
                jest.spyOn(CreateUserValidator, 'validateAndTransform')
                    .mockResolvedValue([validationError, undefined]);

                await userController.create(
                    requestMock as Request,
                    responseMock as unknown as Response,
                );

                const expectedStatus = 400;
                expect(responseMock.status)
                    .toHaveBeenCalledWith(expectedStatus);
                expect(responseMock.json)
                    .toHaveBeenCalledWith({ error: validationError });
            });
        });

        describe('if userService.create fails', () => {
            describe('if the error is a HttpError', () => {
                test('should response the error and its respectively status code', async () => {
                    const serviceErrorMssg = faker.string.alpha();
                    const httpError = HttpError.forbidden(serviceErrorMssg);
                    userServiceMock.create.mockRejectedValue(httpError);

                    await userController.create(
                        requestMock as Request,
                        responseMock as unknown as Response,
                    );

                    expect(responseMock.status)
                        .toHaveBeenCalledWith(httpError.statusCode);
                    expect(responseMock.json)
                        .toHaveBeenCalledWith({ error: serviceErrorMssg });
                });
            });

            describe('if the error is an unexpected error', () => {
                test('should call the logs service', async () => {
                    // TODO:
                });

                test('should response a mssg indicating the err is unexpected and 500 status code', async () => {
                    const unknownError = faker.string.alpha();
                    userServiceMock.create.mockRejectedValue(unknownError);

                    await userController.create(
                        requestMock as Request,
                        responseMock as unknown as Response,
                    );

                    const expectedStatus = 500;
                    expect(responseMock.status)
                        .toHaveBeenCalledWith(expectedStatus);
                    expect(responseMock.json)
                        .toHaveBeenCalledWith({ error: UNEXPECTED_ERROR_MESSAGE });
                });
            });
        });
    });

    describe('LOGIN', () => {
        test('validation function should be called with data in body', async () => {
            const validationSpy = jest.spyOn(LoginUserValidator, 'validate');
            const user = { name: faker.internet.username() };
            requestMock.body = user;

            await userController.login(
                requestMock as Request,
                responseMock as unknown as Response,
            );

            expect(validationSpy)
                .toHaveBeenCalledWith(user);
        });

        test('userService.login should be called with the user returned by validator', async () => {
            const user = { name: faker.internet.username() };
            jest.spyOn(LoginUserValidator, 'validate')
                .mockResolvedValue([undefined, user as any]);

            await userController.login(
                requestMock as Request,
                responseMock as unknown as Response,
            );

            expect(userServiceMock.login)
                .toHaveBeenCalledWith(user);
        });

        describe('if everything sucess', () => {
            test('should response the logged in user and ok status code', async () => {
                const user = { name: faker.internet.username() };
                userServiceMock.login.mockResolvedValue(user);

                await userController.login(
                    requestMock as Request,
                    responseMock as unknown as Response,
                );

                const expectedStatus = 200;
                expect(responseMock.status)
                    .toHaveBeenCalledWith(expectedStatus)
                expect(responseMock.json)
                    .toHaveBeenCalledWith(user);
            });
        });

        describe('if validation fails', () => {
            test('should response error and bad request status code', async () => {
                const validationError = faker.string.alpha();
                jest.spyOn(LoginUserValidator, 'validate')
                    .mockResolvedValue([validationError, undefined]);

                await userController.login(
                    requestMock as Request,
                    responseMock as unknown as Response,
                );

                const expectedStatus = 400;
                expect(responseMock.status)
                    .toHaveBeenCalledWith(expectedStatus)
                expect(responseMock.json)
                    .toHaveBeenCalledWith({ error: validationError });
            });
        });

        describe('if userService.login fails', () => {
            describe('if the error is a HttpError', () => {
                test('should response error and its respectively status code', async () => {
                    const errorMessage = faker.string.alpha();
                    const httpError = HttpError.forbidden(errorMessage);
                    userServiceMock.login.mockRejectedValue(httpError);

                    await userController.login(
                        requestMock as Request,
                        responseMock as unknown as Response,
                    );

                    expect(responseMock.status)
                        .toHaveBeenCalledWith(httpError.statusCode)
                    expect(responseMock.json)
                        .toHaveBeenCalledWith({ error: errorMessage });
                });
            });

            describe('if the error is an unexpected error', () => {
                test('should call the logs service', async () => {
                    // TODO:
                });

                test('should response a mssg indicating the err is unexpected and 500 status code', async () => {
                    const unknownError = faker.string.alpha();
                    userServiceMock.login.mockRejectedValue(unknownError);

                    await userController.login(
                        requestMock as Request,
                        responseMock as unknown as Response,
                    );

                    const expectedStatus = 500;
                    expect(responseMock.status)
                        .toHaveBeenCalledWith(expectedStatus)
                    expect(responseMock.json)
                        .toHaveBeenCalledWith({ error: UNEXPECTED_ERROR_MESSAGE });
                });
            });
        });
    });

    describe('VALIDATE EMAIL', () => {
        test('userService.validateEmail should be called with the token in req.params', async () => {
            const token = faker.string.alpha();
            requestMock.params.token = token;

            await userController.validateEmail(
                requestMock as Request,
                responseMock as unknown as Response,
            );

            expect(userServiceMock.validateEmail)
                .toHaveBeenCalledWith(token);
        });

        describe('if everything sucess', () => {
            test('should response no content status code', async () => {
                await userController.validateEmail(
                    requestMock as Request,
                    responseMock as unknown as Response,
                );

                const expectedStatus = 204;
                expect(responseMock.status)
                    .toHaveBeenCalledWith(expectedStatus)
            });
        });

        describe('if userService.validateEmail fails', () => {
            describe('if error is a HttpError', () => {
                test('should response error and its respectively status code', async () => {
                    const errorMessage = faker.string.alpha();
                    const httpError = HttpError.notFound(errorMessage);
                    userServiceMock.validateEmail
                        .mockRejectedValue(httpError);

                    await userController.validateEmail(
                        requestMock as Request,
                        responseMock as unknown as Response,
                    );

                    expect(responseMock.status)
                        .toHaveBeenCalledWith(httpError.statusCode);
                    expect(responseMock.json)
                        .toHaveBeenCalledWith({ error: errorMessage });
                });
            });

            describe('if error is an unexpected error', () => {
                test('should call the logs service', async () => {
                    // TODO:
                });

                test('should response a mssg indicating the err is unexpected and 500 status code', async () => {
                    const unknownError = faker.string.alpha();
                    userServiceMock.validateEmail.mockRejectedValue(unknownError);

                    await userController.validateEmail(
                        requestMock as Request,
                        responseMock as unknown as Response,
                    );

                    const expectedStatus = 500;
                    expect(responseMock.status)
                        .toHaveBeenCalledWith(expectedStatus)
                    expect(responseMock.json)
                        .toHaveBeenCalledWith({ error: UNEXPECTED_ERROR_MESSAGE });
                });
            });
        });
    });

    describe('FIND ONE', () => {
        test('userService.findOne should be called with the id in req.params.id', async () => {
            const id = faker.number.int();
            requestMock.params.id = id;

            await userController.findOne(
                requestMock as Request,
                responseMock as unknown as Response,
            );

            expect(userServiceMock.findOne)
                .toHaveBeenCalledWith(id);
        });

        describe('if everything sucess', () => {
            test('should response the user and ok status code', async () => {
                const user = { name: faker.internet.username() };
                userServiceMock.findOne
                    .mockResolvedValue(user);

                await userController.findOne(
                    requestMock as Request,
                    responseMock as unknown as Response,
                );

                const expectedStatus = 200;
                expect(responseMock.status)
                    .toHaveBeenCalledWith(expectedStatus)
                expect(responseMock.json)
                    .toHaveBeenCalledWith(user);
            });
        });

        describe('if userService.findOne fails', () => {
            describe('if error is a HttpError', () => {
                test('should response error and its respectively status code', async () => {
                    const errorMessage = faker.string.alpha();
                    const httpError = HttpError.unAuthorized(errorMessage);
                    userServiceMock.findOne
                        .mockRejectedValue(httpError);

                    await userController.findOne(
                        requestMock as Request,
                        responseMock as unknown as Response,
                    );

                    expect(responseMock.status)
                        .toHaveBeenCalledWith(httpError.statusCode)
                    expect(responseMock.json)
                        .toHaveBeenCalledWith({ error: errorMessage });
                });
            });

            describe('if error is an unexpected error', () => {
                test('should call the logs service', async () => {
                    // TODO:
                });

                test('should response a mssg indicating the err is unexpected and 500 status code', async () => {
                    const unknownError = faker.string.alpha();
                    userServiceMock.findOne.mockRejectedValue(unknownError);

                    await userController.findOne(
                        requestMock as Request,
                        responseMock as unknown as Response,
                    );

                    const expectedStatus = 500;
                    expect(responseMock.status)
                        .toHaveBeenCalledWith(expectedStatus)
                    expect(responseMock.json)
                        .toHaveBeenCalledWith({ error: UNEXPECTED_ERROR_MESSAGE });
                });
            });
        });
    });

    describe('FIND ALL', () => {
        test('should NOT throw an error if limit and page are not in query', async () => {
            await userController.findAll(
                requestMock as Request,
                responseMock as unknown as Response,
            );

            expect(responseMock.status)
                .toHaveBeenCalledWith(200);
        });

        test('userService.findAll should be called with page and limit as numbers', async () => {
            const page = `${faker.number.int({ max: 30 })}`;
            const limit = `${faker.number.int({ max: 30 })}`
            requestMock.query.page = page;
            requestMock.query.limit = limit;

            await userController.findAll(
                requestMock as Request,
                responseMock as unknown as Response,
            );

            const pageNumber = parseInt(page);
            const limitNumber = parseInt(limit);
            expect(userServiceMock.findAll)
                .toHaveBeenCalledWith(limitNumber, pageNumber);
        });

        describe('if everything sucess', () => {
            test('should response the users found and ok status code', async () => {
                const users = [{ name: faker.internet.username() }];
                userServiceMock.findAll
                    .mockResolvedValue(users);

                await userController.findAll(
                    requestMock as Request,
                    responseMock as unknown as Response,
                );

                const expectedStatus = 200;
                expect(responseMock.status)
                    .toHaveBeenCalledWith(expectedStatus)
                expect(responseMock.json)
                    .toHaveBeenCalledWith(users);
            });
        });

        describe('if userService.findAll fails', () => {
            describe('if error is a HttpError', () => {
                test('should response error and its respectively status code', async () => {
                    const errorMessage = faker.string.alpha();
                    const httpError = HttpError.forbidden(errorMessage);
                    userServiceMock.findAll
                        .mockRejectedValue(httpError);

                    await userController.findAll(
                        requestMock as Request,
                        responseMock as unknown as Response,
                    );

                    expect(responseMock.status)
                        .toHaveBeenCalledWith(httpError.statusCode)
                    expect(responseMock.json)
                        .toHaveBeenCalledWith({ error: errorMessage });
                });
            });

            describe('if error is an unexpected error', () => {
                test('should call the logs service', async () => {
                    // TODO:
                });

                test('should response a mssg indicating the err is unexpected and 500 status code', async () => {
                    const unknownError = faker.string.alpha();
                    userServiceMock.findAll.mockRejectedValue(unknownError);

                    await userController.findAll(
                        requestMock as Request,
                        responseMock as unknown as Response,
                    );

                    const expectedStatus = 500;
                    expect(responseMock.status)
                        .toHaveBeenCalledWith(expectedStatus)
                    expect(responseMock.json)
                        .toHaveBeenCalledWith({ error: UNEXPECTED_ERROR_MESSAGE });
                });
            });
        });
    });

    describe('DELETE ONE', () => {
        test('userService.deleteOne should be called with the id in req.params', async () => {
            const id = faker.string.alpha();
            requestMock.params.id = id;

            await userController.deleteOne(
                requestMock as Request,
                responseMock as unknown as Response,
            );

            expect(userServiceMock.deleteOne)
                .toHaveBeenCalledWith(id);
        });

        describe('if everything sucess', () => {
            test('should response no content status code', async () => {
                await userController.deleteOne(
                    requestMock as Request,
                    responseMock as unknown as Response,
                );

                const expectedStatus = 204;
                expect(responseMock.status)
                    .toHaveBeenCalledWith(expectedStatus)
            });
        });

        describe('if userService.deleteOne fails', () => {
            describe('if error is a HttpError', () => {
                test('should response error and its respectively status code', async () => {
                    const errorMessage = faker.string.alpha();
                    const httpError = HttpError.forbidden(errorMessage);
                    userServiceMock.deleteOne
                        .mockRejectedValue(httpError);

                    await userController.deleteOne(
                        requestMock as Request,
                        responseMock as unknown as Response,
                    );

                    expect(responseMock.status)
                        .toHaveBeenCalledWith(httpError.statusCode)
                    expect(responseMock.json)
                        .toHaveBeenCalledWith({ error: errorMessage });
                });
            });


            describe('if error is an unexpected error', () => {
                test('should call the logs service', async () => {
                    // TODO:
                });

                test('should response a mssg indicating the err is unexpected and 500 status code', async () => {
                    const unknownError = faker.string.alpha();
                    userServiceMock.deleteOne.mockRejectedValue(unknownError);

                    await userController.deleteOne(
                        requestMock as Request,
                        responseMock as unknown as Response,
                    );

                    const expectedStatus = 500;
                    expect(responseMock.status)
                        .toHaveBeenCalledWith(expectedStatus)
                    expect(responseMock.json)
                        .toHaveBeenCalledWith({ error: UNEXPECTED_ERROR_MESSAGE });
                });
            });
        });
    });

    describe('UPDATE ONE', () => {
        test('validation should be called with data in body', async () => {
            const data = { name: faker.internet.username() };
            requestMock.body = data;
            const validationSpy = jest.spyOn(UpdateUserValidator, 'validateAndTransform');

            await userController.updateOne(
                requestMock as Request,
                responseMock as unknown as Response,
            );

            expect(validationSpy).toHaveBeenCalledWith(data);
        });

        test('userService.updateOne should be called with the validated data and id in req.params', async () => {
            const id = faker.string.alpha();
            const validatedData = { name: faker.internet.username() };
            requestMock.params.id = id;
            jest.spyOn(UpdateUserValidator, 'validateAndTransform')
                .mockResolvedValue([undefined, validatedData]);

            await userController.updateOne(
                requestMock as Request,
                responseMock as unknown as Response,
            );

            expect(userServiceMock.updateOne)
                .toHaveBeenCalledWith(id, validatedData);
        });

        describe('if validation fails', () => {
            test('should return error and bad request status code', async () => {
                const validationError = faker.string.alpha();
                jest.spyOn(UpdateUserValidator, 'validateAndTransform')
                    .mockResolvedValue([validationError, undefined]);

                await userController.updateOne(
                    requestMock as Request,
                    responseMock as unknown as Response,
                );

                const expectedStatus = 400;
                expect(responseMock.status)
                    .toHaveBeenCalledWith(expectedStatus)
                expect(responseMock.json)
                    .toHaveBeenCalledWith({ error: validationError });
            });
        });

        describe('if everything sucess', () => {
            test('should return the updated user and 200 status code', async () => {
                const updatedUser = { name: faker.internet.username() };
                userServiceMock.updateOne
                    .mockResolvedValue(updatedUser);

                await userController.updateOne(
                    requestMock as Request,
                    responseMock as unknown as Response,
                );

                const expectedStatus = 200;
                expect(responseMock.status)
                    .toHaveBeenCalledWith(expectedStatus)
                expect(responseMock.json)
                    .toHaveBeenCalledWith(updatedUser);
            });
        });

        describe('if userService.updateOne fails', () => {
            describe('if error is a HttpError', () => {
                test('should response error and its respectively status code', async () => {
                    const errorMessage = faker.string.alpha();
                    const httpError = HttpError.notFound(errorMessage);
                    userServiceMock.updateOne
                        .mockRejectedValue(httpError);

                    await userController.updateOne(
                        requestMock as Request,
                        responseMock as unknown as Response,
                    );

                    expect(responseMock.status)
                        .toHaveBeenCalledWith(httpError.statusCode)
                    expect(responseMock.json)
                        .toHaveBeenCalledWith({ error: errorMessage });
                });
            });

            describe('if error is an unexpected error', () => {
                test('should call the logs service', async () => {
                    // TODO:
                });

                test('should response a mssg indicating the err is unexpected and 500 status code', async () => {
                    const unknownError = faker.string.alpha();
                    userServiceMock.updateOne.mockRejectedValue(unknownError);

                    await userController.updateOne(
                        requestMock as Request,
                        responseMock as unknown as Response,
                    );

                    const expectedStatus = 500;
                    expect(responseMock.status)
                        .toHaveBeenCalledWith(expectedStatus)
                    expect(responseMock.json)
                        .toHaveBeenCalledWith({ error: UNEXPECTED_ERROR_MESSAGE });
                });
            });
        });
    });
});