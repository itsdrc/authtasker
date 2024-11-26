import { faker } from '@faker-js/faker/.';
import { mock, mockDeep, MockProxy } from 'jest-mock-extended';
import { Model, Query, Types } from "mongoose";

import type { FindMockQuery, NoReadonly } from '../test-helpers/types';

import { EmailService } from "@root/services/email.service";
import { HashingService } from "@root/services/hashing.service";
import { JwtService } from "@root/services/jwt.service";
import { User } from "@root/types/user/user.type";
import { UserService } from "@root/services/user.service";
import { ConfigService } from '@root/services/config.service';

// These tests only test the most critical parts of the service:
// validateEmail, sendEmailValidationLink, create and login

type UserModelMocked = MockProxy<Model<User>>;

describe('UserService', () => {
    let hashingServiceMock: MockProxy<HashingService>;
    let jwtServiceMock: MockProxy<JwtService>;
    let configServiceMock: MockProxy<NoReadonly<ConfigService>>;
    let emailServiceMock: MockProxy<EmailService>;
    let userModelMock: FindMockQuery<UserModelMocked> & UserModelMocked;
    let userService: UserService;

    // Disables console.error
    console['error'] = jest.fn();

    beforeEach(() => {
        hashingServiceMock = mockDeep<HashingService>();
        jwtServiceMock = mockDeep<JwtService>();
        userModelMock = (mockDeep<Model<User>>() as any);
        configServiceMock = mockDeep<NoReadonly<ConfigService>>();
        emailServiceMock = mockDeep<EmailService>();

        // this allows, for example, findOne().exec() to be a mock...
        userModelMock.findOne.mockReturnValue(mock<Query<any, any>>());
        userModelMock.findById.mockReturnValue(mock<Query<any, any>>());
        userModelMock.findByIdAndDelete.mockReturnValue(mock<Query<any, any>>());
        userModelMock.findByIdAndUpdate.mockReturnValue(mock<Query<any, any>>());

        userService = new UserService(
            configServiceMock as any,
            userModelMock,
            hashingServiceMock,
            jwtServiceMock,
            emailServiceMock
        );
    });

    describe('VALIDATE EMAIL', () => {
        describe('Token verification', () => {
            test('jwtService.verify should be called with the token', async () => {
                // stub token verification (email must be in token)
                jwtServiceMock.verify
                    .mockReturnValue({ email: faker.string.alpha() });

                // stub user in db (must contain a save function)
                userModelMock.findOne().exec
                    .mockResolvedValue({ save: jest.fn(), });

                // call method with test token
                const testToken = faker.string.alpha();
                await userService.validateEmail(testToken);

                expect(jwtServiceMock.verify)
                    .toHaveBeenCalledWith(testToken);
            });

            describe('if jwtService.verify fails', () => {
                describe('if does not return the payload', () => {
                    test('should throw bad request http error', async () => {
                        // mock token verification
                        jwtServiceMock.verify
                            .mockReturnValue(undefined);

                        // assert it throws any message and 400 status code
                        expect(userService.validateEmail(''))
                            .rejects
                            .toThrow(
                                expect.objectContaining({
                                    message: expect.any(String),
                                    statusCode: 400,
                                })
                            );
                    });
                });

                describe('if email is not in payload', () => {
                    test('should throw internal server http error', async () => {
                        // mock token verification with an object with no email
                        jwtServiceMock.verify.mockReturnValue({});

                        // assert it throws any message and 500 status code
                        expect(userService.validateEmail(''))
                            .rejects
                            .toThrow(
                                expect.objectContaining({
                                    message: expect.any(String),
                                    statusCode: 500,
                                })
                            );
                    });
                });
            });
        });

        describe('Find user in db', () => {
            test('userModel.findOne should be called with the email in payload', async () => {
                // mock token verification to return a test email
                const testEmail = faker.internet.email();
                jwtServiceMock.verify
                    .mockReturnValue({ email: testEmail });

                // stub user found in db (must contain a save function)
                userModelMock.findOne().exec
                    .mockResolvedValue({ save: jest.fn(), });

                await userService.validateEmail('');

                expect(userModelMock.findOne)
                    .toHaveBeenCalledWith({ email: testEmail });
            });

            describe('if user is not found', () => {
                test('should throw not found error', async () => {
                    // stub token verification (email must be in token)
                    jwtServiceMock.verify
                        .mockReturnValue({ email: faker.string.alpha() });

                    // mock findOne().exec() to return a undefined user
                    userModelMock.findOne().exec
                        .mockResolvedValue(undefined);

                    // assert it throws any message and 404 status code
                    expect(userService.validateEmail(''))
                        .rejects
                        .toThrow(
                            expect.objectContaining({
                                message: expect.any(String),
                                statusCode: 404,
                            })
                        );
                });
            });
        });

        describe('If everything sucess', () => {
            test('user.validateEmail should be udpated to true', async () => {
                // stub token verification (email must be in token)
                jwtServiceMock.verify
                    .mockReturnValue({ email: faker.string.alpha() });

                // mock user found in db 
                const mockUserFound = {
                    emailValidated: false,
                    save: jest.fn(),
                };
                userModelMock.findOne().exec
                    .mockResolvedValue(mockUserFound);

                await userService.validateEmail('');

                // assert emailValidated is true and save was called
                expect(mockUserFound.emailValidated)
                    .toBeTruthy();
                expect(mockUserFound.save)
                    .toHaveBeenCalledTimes(1)
            });
        });
    });

    describe('CREATE', () => {
        describe('Password hashing', () => {
            test('hashingService.hash should be called with user password', async () => {
                // stub userModel.create() to return an object
                // so "created.id" does not throw an error
                userModelMock.create
                    .mockResolvedValue({} as any);

                // create a test user with a test password. Password is changed
                // across the function so we need to pass a copy.
                const testPassword = faker.internet.password()
                const testUser = { password: testPassword };

                await userService.create(testUser as any);

                expect(hashingServiceMock.hash)
                    .toHaveBeenCalledWith(testPassword);
            });
        });

        describe('User creation in db', () => {
            test('userModel.create should be called with user with a hashed password', async () => {
                // mock hash result
                const mockHashedPassword = faker.food.vegetable();
                hashingServiceMock.hash
                    .mockResolvedValue(mockHashedPassword);

                // stub userModel.create() to return an object
                // so "created.id" not throws an error
                userModelMock.create
                    .mockResolvedValue({} as any);

                await userService.create({} as any);

                expect(userModelMock.create)
                    .toHaveBeenCalledWith(
                        expect.objectContaining({
                            password: mockHashedPassword,
                        })
                    );
            });

            describe('if create fails with code 11000 (duplicate key)', () => {
                test('should return bad request http error', async () => {
                    // mock userModel.create to throw a error with 11000 code
                    const mockCreationError = {
                        code: 11000,
                        keyValue: [],
                    };
                    userModelMock.create
                        .mockRejectedValue(mockCreationError);

                    // assert it throws any message and 400 status code
                    expect(userService.create({} as any))
                        .rejects
                        .toThrow(
                            expect.objectContaining({
                                message: expect.any(String),
                                statusCode: 400,
                            })
                        );
                });
            });
        });

        describe('Token generation', () => {
            test('jwtService.generate should be called with the created user id', async () => {
                // mock userModel.create to return a test user
                const testUser = {
                    id: faker.food.vegetable()
                };
                userModelMock.create
                    .mockResolvedValue(testUser as any);

                await userService.create(testUser as any);

                // assert the id is the same 
                expect(jwtServiceMock.generate)
                    .toHaveBeenCalledWith({ id: testUser.id });
            });
        });

        describe('if everything success', () => {
            test('should return the created user and the generated token', async () => {
                // mock created user
                const userCreatedMock = { name: faker.internet.username() };
                userModelMock.create
                    .mockResolvedValue(userCreatedMock as any);

                // mock token generation
                const tokenMock = faker.food.vegetable();
                jwtServiceMock.generate
                    .mockReturnValue(tokenMock);

                expect(userService.create({} as any))
                    .resolves
                    .toStrictEqual({
                        token: tokenMock,
                        user: userCreatedMock,
                    });
            });
        });

        describe('Email validation', () => {
            describe('if configService.MAIL_SERVICE is enabled', () => {
                test('sendEmailValidationLink should be called with user email', async () => {
                    // mock to enable mock service
                    configServiceMock.mailServiceIsDefined
                        .mockReturnValue(true);

                    // stub userModel.create() to return an object
                    // so "created.id" does not throw an error
                    userModelMock.create
                        .mockResolvedValue({} as any);

                    // spy private method
                    const sendEmailValidationLinkSpy = jest
                        .spyOn(userService as any, 'sendEmailValidationLink');

                    // call method with a test user
                    const testUser = { email: faker.internet.email() };
                    await userService.create(testUser as any)

                    expect(sendEmailValidationLinkSpy)
                        .toHaveBeenCalledWith(testUser.email);
                });
            });
        });

        describe('if an unexpected error is thrown', () => {
            test('should rethrow it', async () => {
                // mock hash function to throw an error
                const testError = new Error(faker.food.description());
                hashingServiceMock.hash
                    .mockRejectedValue(testError);

                expect(userService.create({} as any))
                    .rejects
                    .toThrow(testError);
            });
        });
    });

    describe('SEND EMAIL VALIDATION (private)', () => {
        describe('if this.emailService DI is not provided and the function was called', () => {
            test('should throw internal server error', async () => {
                // inject everything but email service
                const testUserService = new UserService(
                    configServiceMock as any,
                    userModelMock,
                    hashingServiceMock,
                    jwtServiceMock,
                    undefined
                );

                // assert it throws any message and 500 status code
                expect(testUserService['sendEmailValidationLink'](''))
                    .rejects
                    .toThrow(
                        expect.objectContaining({
                            message: expect.any(String),
                            statusCode: 500,
                        })
                    );
            });

            test('should call logs service', async () => {
                // TODO:
            });
        });

        describe('Token generation', () => {
            test('jwtService.generate should be called with the email', async () => {
                const testEmail = faker.internet.email();

                // its a private function!
                userService['sendEmailValidationLink'](testEmail);

                // assert the email is the same 
                expect(jwtServiceMock.generate)
                    .toHaveBeenCalledWith({ email: testEmail });
            });
        });

        describe('emailService.sendMail should be called with...', () => {
            test('link containing email web_url and the generatedtoken', async () => {
                // mock web url in configService
                const webUrlMock = faker.internet.domainName();
                configServiceMock.WEB_URL = webUrlMock;

                // mock token generation
                const tokenMock = faker.food.vegetable();
                jwtServiceMock.generate
                    .mockReturnValue(tokenMock);

                // its a private function
                userService['sendEmailValidationLink']('');

                // assert html field contains the token 
                expect(emailServiceMock.sendMail)
                    .toHaveBeenCalledWith(
                        expect.objectContaining({
                            html: expect.stringContaining(tokenMock),
                        })
                    );

                // assert html field contains the web url
                expect(emailServiceMock.sendMail)
                    .toHaveBeenCalledWith(
                        expect.objectContaining({
                            html: expect.stringContaining(webUrlMock),
                        })
                    );
            });

            test('the email passed', async () => {
                const testEmail = faker.internet.email();

                // its a private function
                userService['sendEmailValidationLink'](testEmail);

                // assert html field contains the email
                expect(emailServiceMock.sendMail)
                    .toHaveBeenCalledWith(
                        expect.objectContaining({
                            html: expect.stringContaining(testEmail),
                        })
                    );
            });
        });
    });

    describe('LOGIN', () => {
        describe('Find user in db', () => {
            test('userModel.findOne should be called with user email', async () => {
                // stub userModel.findOne().exec()
                userModelMock.findOne().exec
                    .mockResolvedValue({});

                // stub password comparison
                hashingServiceMock.compare
                    .mockResolvedValue(true);

                // call method with a test user
                const testUser = { email: faker.internet.email() };
                await userService.login(testUser as any);

                expect(userModelMock.findOne)
                    .toHaveBeenCalledWith({ email: testUser.email });
            });

            describe('if user is not found', () => {
                test('should throw bad request http error', async () => {
                    // mock userModel.findOne().exec() to return undefined
                    userModelMock.findOne().exec
                        .mockResolvedValue(undefined);

                    // stub password comparison
                    hashingServiceMock.compare
                        .mockResolvedValue(true);

                    // assert it throws any message and 400 status code
                    expect(userService.login({} as any))
                        .rejects
                        .toThrow(expect.objectContaining({
                            message: expect.any(String),
                            statusCode: 400,
                        }));
                });
            });
        });

        describe('Password matching', () => {
            test('hashingService.compare should be called with user password and userInDb password', async () => {
                // mock userModel.findOne().exec() to return a user with a password
                const userInDb = { password: faker.internet.password() };
                userModelMock.findOne().exec
                    .mockResolvedValue(userInDb);

                // stub password comparison to avoid error
                hashingServiceMock.compare
                    .mockResolvedValue(true);

                // call method with a test user
                const testUser = { password: faker.internet.password() };
                await userService.login(testUser as any);

                expect(hashingServiceMock.compare)
                    .toHaveBeenCalledWith(testUser.password,
                        userInDb.password
                    );
            });

            describe('if hashingService.compare returns false', () => {
                test('should throw bad request http error', async () => {
                    // stub userModel.findOne().exec()
                    userModelMock.findOne().exec
                        .mockResolvedValue({});

                    // mock comparison to fail
                    hashingServiceMock.compare
                        .mockResolvedValue(false);

                    // assert it throws any message and 400 status code
                    expect(userService.login({} as any))
                        .rejects
                        .toThrow(expect.objectContaining({
                            message: expect.any(String),
                            statusCode: 400
                        }));
                });
            });
        });

        describe('Token generation', () => {
            test('jwtService.jwt should be called with user found id', async () => {
                // mock userModel.findOne().exec() to return a user with id
                const userInDbMock = { id: faker.food.vegetable() };
                userModelMock.findOne().exec
                    .mockResolvedValue(userInDbMock);

                // stub password comparison
                hashingServiceMock.compare
                    .mockResolvedValue(true);

                await userService.login({} as any)

                // assert the id is the same
                expect(jwtServiceMock.generate)
                    .toHaveBeenCalledWith({ id: userInDbMock.id });
            });
        });

        describe('if everything sucess', () => {
            test('should return token and user', async () => {
                // mock userModel.findOne().exec()
                const userInDbMock = { email: faker.internet.email() };
                userModelMock.findOne().exec
                    .mockResolvedValue(userInDbMock);

                // stub password comparison
                hashingServiceMock.compare
                    .mockResolvedValue(true);

                // mock token generation
                const token = faker.food.vegetable();
                jwtServiceMock.generate.mockReturnValue(token);

                expect(userService.login({} as any))
                    .resolves
                    .toStrictEqual({
                        token,
                        user: userInDbMock,
                    });
            });
        });
    });
});