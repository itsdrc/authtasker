import { Model, Query, Types } from "mongoose";
import { mock, MockProxy } from 'jest-mock-extended';
import { IUser } from "@root/interfaces/user/user.interface";
import { ConfigService, EmailService, HashingService, JwtBlackListService, JwtService, LoggerService, UserService } from "@root/services";
import { NoReadonly } from "../helpers/types/no-readonly.type";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { FindMockQuery } from "../helpers/types/find-mock-query.type";
import { faker } from "@faker-js/faker/.";
import { FORBIDDEN_MESSAGE } from "@root/rules/errors/messages/error.messages";
import { TOKEN_PURPOSES } from "@root/rules/constants/token-purposes.constants";
import { doesNotMatch } from "node:assert";

describe('User Service', () => {
    let configService: MockProxy<NoReadonly<ConfigService>>;
    let userModel: FindMockQuery<MockProxy<Model<IUser>>>;
    let hashingService: MockProxy<HashingService>;
    let jwtService: MockProxy<JwtService>;
    let loggerService: MockProxy<LoggerService>;
    let emailService: MockProxy<EmailService>;
    let userService: UserService;
    let jwtBlackListService: MockProxy<JwtBlackListService>;

    beforeAll(() => {
        SystemLoggerService.info = jest.fn();
        SystemLoggerService.error = jest.fn();
        SystemLoggerService.warn = jest.fn();
    });

    beforeEach(() => {
        // properties are not readonly
        configService = mock<NoReadonly<ConfigService>>();
        userModel = (mock<Model<IUser>>() as any);
        hashingService = mock<HashingService>();
        jwtService = mock<JwtService>();
        loggerService = mock<LoggerService>();
        emailService = mock<EmailService>();
        jwtBlackListService = mock<JwtBlackListService>();
        userService = new UserService(
            configService as unknown as ConfigService,
            userModel as unknown as Model<IUser>,
            hashingService,
            jwtService,
            jwtBlackListService,
            loggerService,
            emailService,
        );

        // this allows, for example, findOne().exec() to be a mock...
        userModel.find.mockReturnValue(mock<Query<any, any>>());
        userModel.findOne.mockReturnValue(mock<Query<any, any>>());
        userModel.findById.mockReturnValue(mock<Query<any, any>>());
        userModel.findByIdAndDelete.mockReturnValue(mock<Query<any, any>>());
        userModel.findByIdAndUpdate.mockReturnValue(mock<Query<any, any>>());

        userModel.countDocuments.mockReturnValue(mock<Query<any, any>>());
    });

    describe('sendEmailValidationLink', () => {
        describe('If email service is not injected', () => {
            test('should throw internal server error', async () => {
                const expectedErrorMessage = `Email can not be validated due to a server error`;
                const expectedErrorStatus = 500;

                // null email service
                (userService['emailService'] as any) = null;

                expect(userService['sendEmailValidationLink']('test-email'))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: expectedErrorStatus,
                        message: expectedErrorMessage
                    }));
            });
        });

        test('email should be sent to the provided email', async () => {
            const email = 'test-email@gmail.com';
            await userService['sendEmailValidationLink'](email);
            expect(emailService.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: email
                })
            );
        });

        describe('Link sent in email message', () => {
            test('should contain the confirmEmailValidation url and token', async () => {
                const mockTokenGenerated = '12345';
                jwtService.generate.mockReturnValue(mockTokenGenerated);

                const webURL = 'test-url/';
                configService.WEB_URL = webURL;

                const expectedLink = `${webURL}api/users/confirmEmailValidation/${mockTokenGenerated}`;

                await userService['sendEmailValidationLink']('test-email');

                expect(emailService.sendMail).toHaveBeenCalledWith(
                    expect.objectContaining({
                        html: expect.stringContaining(expectedLink)
                    })
                );
            });
        });
    });

    describe('blackListToken', () => {
        test('jwtBlacklistService.blacklist should be called with jti and remaining token exp. time', async () => {
            const testJti = 'test-jti';
            const remainingTokenExpirationTime = 60;
            const tokenExpirationTime = Math.floor(Date.now() / 1000) + remainingTokenExpirationTime;

            await userService['blackListToken'](testJti, tokenExpirationTime);

            expect(jwtBlackListService.blacklist).toHaveBeenCalledWith(testJti, remainingTokenExpirationTime);
        });
    });

    describe('requestEmailValidation', () => {
        describe('If MAIL_SERVICE env is false', () => {
            test('sendEmailValidationLink should not be called', async () => {
                configService.mailServiceIsDefined.mockReturnValue(false);

                // return something to avoid error when user is not found
                userModel
                    .findById()
                    .exec
                    .mockReturnValue({} as any);

                const sendEmailValidationLinkSpy = jest.spyOn(userService as any, 'sendEmailValidationLink')
                    .mockImplementation();

                await userService.requestEmailValidation('test-id');
                expect(sendEmailValidationLinkSpy)
                    .not
                    .toHaveBeenCalled();
            });
        });

        describe('If MAIL_SERVICE env is true', () => {
            test('sendEmailValidationLink should be called', async () => {
                configService.mailServiceIsDefined.mockReturnValue(true);

                // return something to avoid error when user is not found
                userModel
                    .findById()
                    .exec
                    .mockResolvedValue({} as any);

                const sendEmailValidationLinkSpy = jest.spyOn(userService as any, 'sendEmailValidationLink')
                    .mockImplementation();

                await userService.requestEmailValidation('test-id');

                expect(sendEmailValidationLinkSpy).toHaveBeenCalled();
            });
        });

        describe('If user is not found', () => {
            test('should throw bad request exception', async () => {
                const expectedErrorMessage = `User not found`;
                const expectedErrorStatus = 400;

                userModel
                    .findById()
                    .exec
                    .mockResolvedValue(null);

                expect(userService.requestEmailValidation('test-id'))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: expectedErrorStatus,
                        message: expectedErrorMessage
                    }))
            });
        });

        describe('User email is already validated', () => {
            test('should throw bad request exception', async () => {
                const expectedErrorMessage = `User email is already validated`;
                const expectedErrorStatus = 400;
                userModel
                    .findById()
                    .exec
                    .mockResolvedValue({
                        emailValidated: true
                    });

                expect(userService.requestEmailValidation('test-id'))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: expectedErrorStatus,
                        message: expectedErrorMessage
                    }))
            });
        });
    });

    describe('confirmEmailValidation', () => {
        describe('Token is not a valid token', () => {
            test('should throw bad request exception', async () => {
                const expectedErrorMessage = `Invalid token`;
                const expectedErrorStatus = 400;

                jwtService.verify.mockReturnValue(null);

                expect(userService.confirmEmailValidation('test-token'))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: expectedErrorStatus,
                        message: expectedErrorMessage
                    }));
            });
        });

        describe('Email is not in token', () => {
            test('should throw bad request exception', async () => {
                const expectedErrorMessage = `Invalid token`;
                const expectedErrorStatus = 400;

                // token is verified but the payload does not include email
                jwtService.verify.mockReturnValue({
                    purpose: TOKEN_PURPOSES.EMAIL_VALIDATION,
                } as any);

                expect(userService.confirmEmailValidation('test'))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: expectedErrorStatus,
                        message: expectedErrorMessage
                    }));
            });
        });

        describe('Token purpose is not the expected one', () => {
            test('should throw bad request exception', async () => {
                const expectedErrorMessage = `Invalid token`;
                const expectedErrorStatus = 400;

                // token is verified but the payload does not include a correct purpose
                jwtService.verify.mockReturnValue({
                    purpose: TOKEN_PURPOSES.SESSION,
                    email: 'test@gmail.com'
                } as any);

                expect(userService.confirmEmailValidation('test'))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: expectedErrorStatus,
                        message: expectedErrorMessage
                    }));
            });
        });

        describe('Token is blacklisted', () => {
            test('should throw bad request exception', async () => {
                const expectedErrorMessage = `Invalid token`;
                const expectedErrorStatus = 400;

                // token is verified
                jwtService.verify.mockReturnValue({
                    purpose: TOKEN_PURPOSES.EMAIL_VALIDATION,
                    email: 'test@gmail.com'
                } as any);

                // mock blacklisting
                jwtBlackListService
                    .isBlacklisted
                    .mockResolvedValue(true);

                expect(userService.confirmEmailValidation('test'))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: expectedErrorStatus,
                        message: expectedErrorMessage
                    }));
            });
        });

        describe('User in token does not exists', () => {
            test('should throw not found exception', async () => {
                const expectedErrorMessage = `User not found`;
                const expectedErrorStatus = 404;

                // return a valid token
                jwtService.verify.mockReturnValue({
                    purpose: TOKEN_PURPOSES.EMAIL_VALIDATION,
                    email: 'test@gmail.com',
                } as any);

                // stub blacklisting
                jwtBlackListService
                    .isBlacklisted
                    .mockResolvedValue(false);

                // user not found
                userModel
                    .findOne()
                    .exec
                    .mockResolvedValue(null);

                expect(userService.confirmEmailValidation('test-token'))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: expectedErrorStatus,
                        message: expectedErrorMessage
                    }));
            });
        });

        describe('Operation success', () => {
            test('user emailValidated and role should be updated', async () => {
                // return a valid token
                jwtService.verify.mockReturnValue({
                    purpose: TOKEN_PURPOSES.EMAIL_VALIDATION,
                    email: 'test@gmail.com',
                } as any);

                // stub blacklisting
                jwtBlackListService
                    .isBlacklisted
                    .mockResolvedValue(false);

                const userFound = {
                    emailValidated: false,
                    role: 'readonly',
                    // make sure "save" is called only when the other properties
                    // were updated.
                    save: jest.fn().mockImplementation(() => {
                        expect(userFound.role).toBe('editor');
                        expect(userFound.emailValidated).toBeTruthy();
                    }),
                };

                userModel
                    .findOne()
                    .exec
                    .mockResolvedValue(userFound);

                await userService.confirmEmailValidation('test-token');

                expect(userFound.save).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('Create', () => {
        describe('User already exists (code 11000)', () => {
            test('should throw bad request exception', async () => {
                userModel.create.mockRejectedValue({ code: 11000, keyValue: [] });
                expect(userService.create({} as any))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: 400
                    }));
            });
        });

        describe('Unexpected error occurs', () => {
            test('should be rethrown', async () => {
                const unexpectedError = new Error('test-error');

                userModel.create.mockRejectedValue(unexpectedError);

                expect(userService.create({} as any))
                    .rejects
                    .toThrow(unexpectedError);
            });
        });

        describe('Operation success', () => {
            test('should return the created user and generated token', async () => {
                const tokenMock = '12345';
                jwtService.generate.mockReturnValue(tokenMock);

                const createdUserMock = 'createdUserMock';
                userModel.create.mockResolvedValue(createdUserMock as any);

                const result = await userService.create({
                    name: faker.food.vegetable(),
                    password: faker.food.vegetable(),
                    email: faker.food.vegetable()
                });

                expect(result).toStrictEqual({
                    user: createdUserMock,
                    token: tokenMock
                });
            });
        });
    });

    describe('Login', () => {
        describe('User is not found', () => {
            test('should throw bad request exception', async () => {
                userModel
                    .findOne()
                    .exec
                    .mockResolvedValue(null);

                const userToLogin = {
                    email: 'test-email',
                    password: 'test-password'
                }

                const expectedErrorMessage = `User with email ${userToLogin.email} not found`;
                const expectedErrorStatus = 400;

                expect(userService.login(userToLogin))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: expectedErrorStatus,
                        message: expectedErrorMessage
                    }));
            });
        });

        describe('Password does not match', () => {
            test('should throw bad request exception', async () => {
                const expectedErrorMessage = 'Incorrect password';
                const expectedErrorStatus = 400;

                // stub user found
                userModel
                    .findOne()
                    .exec
                    .mockResolvedValue({} as any);

                hashingService.compare.mockResolvedValue(false);

                expect(userService.login({
                    email: 'test-email',
                    password: 'test-password'
                }))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: expectedErrorStatus,
                        message: expectedErrorMessage
                    }));
            });
        });

        describe('Process success', () => {
            test('should return user logged in and generated token', async () => {
                // mock user found
                const userFound = { id: 'test-id' };
                userModel
                    .findOne()
                    .exec
                    .mockResolvedValue({ id: userFound.id } as any);

                // stub password comparison
                hashingService.compare.mockResolvedValue(true);

                // mock token generation
                const generatedTokenMock = 'test-token';
                jwtService.generate.mockReturnValue(generatedTokenMock);

                const result = await userService.login({
                    email: 'test-email',
                    password: 'test-password'
                });

                expect(result).toStrictEqual({
                    user: userFound,
                    token: generatedTokenMock
                });
            });
        });
    });

    describe('Logout', () => {
        test('blackListToken should be called with jti and token expiration provided', async () => {
            const mockblackListToken = jest.spyOn(userService as any, 'blackListToken')
                .mockImplementation();

            const testJti = 'test-jti';
            const testTokenExpiration = 9974331312;

            await userService.logout(testJti, testTokenExpiration);

            expect(mockblackListToken).toHaveBeenCalledWith(testJti, testTokenExpiration);
        });
    });

    describe('Find one', () => {
        describe('Id is not valid', () => {
            test('should throw not found exception', async () => {
                const expectedErrorStatus = 404;
                const invalidMongoId = '123abc';
                const expectedErrorMessage = `User with id ${invalidMongoId} not found`;

                expect(userService.findOne(invalidMongoId))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: expectedErrorStatus,
                        message: expectedErrorMessage
                    }));
            });
        });

        describe('User not found', () => {
            test('should throw not found exception', async () => {
                const expectedErrorStatus = 404;
                const mongoID = new Types.ObjectId();
                const expectedErrorMessage = `User with id ${mongoID.toString()} not found`;

                userModel
                    .findById()
                    .exec
                    .mockResolvedValue(null);

                expect(userService.findOne(mongoID.toString()))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: expectedErrorStatus,
                        message: expectedErrorMessage
                    }));
            });
        });

        describe('Operation success', () => {
            test('should return the found user', async () => {
                // mock user found
                const userFound = 'mock-userFound';
                userModel
                    .findById()
                    .exec
                    .mockResolvedValue(userFound);

                const mongoID = new Types.ObjectId();
                const found = await userService.findOne(mongoID.toString())

                expect(found).toBe(userFound);
            });
        });
    });

    describe('Find all', () => {
        describe('limit is 0 or less', () => {
            test('should throw bad request exception', async () => {
                const expectedErrorMessage = 'Limit must be a valid number';
                const expectedErrorStatus = 400;
                const invalidLimit = -10

                expect(userService.findAll(invalidLimit, 11))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: expectedErrorStatus,
                        message: expectedErrorMessage
                    }));
            });
        });

        describe('limit is greater than 100', () => {
            test('should throw bad request exception', async () => {
                const expectedErrorMessage = 'Limit is too large';
                const expectedErrorStatus = 400;
                const invalidLimit = 101

                expect(userService.findAll(invalidLimit, 11))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: expectedErrorStatus,
                        message: expectedErrorMessage
                    }));
            });
        });

        describe('Total documents are zero', () => {
            test('should return an empty array', async () => {
                (userModel
                    .countDocuments()
                    .exec as any)
                    .mockResolvedValue(0);

                const result = await userService.findAll(50, 10);

                expect(result.length).toBe(0);
            });
        });

        describe('page is 0 or less', () => {
            test('should throw bad request exception', async () => {
                // stub countDocuments to not return 0
                (userModel
                    .countDocuments()
                    .exec as any)
                    .mockResolvedValue(10);

                const expectedErrorMessage = 'Page must be a valid number';
                const expectedErrorStatus = 400;
                const invalidPage = -1;

                expect(userService.findAll(11, invalidPage))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: expectedErrorStatus,
                        message: expectedErrorMessage
                    }));
            });
        });

        describe('page is greater than total pages', () => {
            test('should throw bad request exception', async () => {
                // stub countDocuments to not return 0
                (userModel
                    .countDocuments()
                    .exec as any)
                    .mockResolvedValue(10);

                const expectedErrorMessage = 'Invalid page';
                const expectedErrorStatus = 400;
                const totalPages = 20;
                const invalidPage = totalPages + 1;

                const mathCeilMock = jest.spyOn(Math, 'ceil')
                    .mockReturnValue(totalPages);

                expect(userService.findAll(11, invalidPage))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: expectedErrorStatus,
                        message: expectedErrorMessage
                    }));
            });
        });

        describe('Operation success', () => {
            test('should return the find() result after skip and limit were applied', async () => {
                const limit = 10;
                const page = 6;
                const offset = (page - 1) * limit;

                // stub countDocuments to not return 0
                (userModel
                    .countDocuments()
                    .exec as any)
                    .mockResolvedValue(10);

                // mock find().skip()
                userModel.find().skip.mockReturnThis();
                // mock find().skip().limit()
                (userModel.find().skip(offset).limit as any).mockReturnThis();

                // return a greater page than the provided one
                const mathCeilMock = jest.spyOn(Math, 'ceil')
                    .mockReturnValue(page + 1);

                // mock find().skip().limit().exec()
                const mockResult = 'findAllResult';
                (userModel.find().skip(offset).limit(limit).exec as any)
                    .mockResolvedValue(mockResult);

                const result = await userService.findAll(limit, page);

                expect(userModel.find().skip).toHaveBeenCalledWith(offset);
                expect(userModel.find().skip(offset).limit).toHaveBeenCalledWith(limit);
                expect(result).toBe(mockResult);
            });
        });
    });

    describe('Delete one', () => {
        describe('isModificationAuthorized returns null', () => {
            test('should throw forbidden exception', async () => {
                const expectedErrorStatus = 403
                const expectedErrorMessage = FORBIDDEN_MESSAGE;

                jest.spyOn(userService as any, 'IsModificationAuthorized')
                    .mockResolvedValue(null);

                expect(userService.deleteOne({} as any, 'test-id'))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: expectedErrorStatus,
                        message: expectedErrorMessage
                    }));
            });
        });
    });

    describe('Update one', () => {
        describe('isModificationAuthorized returns null', () => {
            test('should throw forbidden exception', async () => {
                const expectedErrorStatus = 403
                const expectedErrorMessage = FORBIDDEN_MESSAGE;

                jest.spyOn(userService as any, 'IsModificationAuthorized')
                    .mockResolvedValue(null);

                expect(userService.updateOne({} as any, 'test-id', {} as any))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: expectedErrorStatus,
                        message: expectedErrorMessage
                    }));
            });
        });

        describe('Password is being updated', () => {
            test('user should be save with the password hashed', async () => {
                // user returned by IsModificationAuthorized function
                const userToUpdate = {
                    password: undefined,
                    // save should be called when the password was already assigned
                    save: jest.fn().mockImplementation(() => {
                        expect(userToUpdate.password).toBe(hashResultMock);
                    }),
                };

                jest.spyOn(userService as any, 'IsModificationAuthorized')
                    .mockResolvedValue(userToUpdate);

                // mock the hashed password
                const hashResultMock = 'test-hash';
                hashingService.hash.mockResolvedValue(hashResultMock);

                await userService.updateOne(
                    {} as any,
                    'test-id',
                    { password: 'test-password' }
                );

                expect(userToUpdate.save).toHaveBeenCalled();
            });
        });

        describe('Email is being updated', () => {
            describe('Former email was validated', () => {
                describe('New email is different', () => {
                    test('role should be updated to readonly', async () => {
                        // user returned by IsModificationAuthorized function
                        const userToUpdate = {
                            email: 'former_email@gmail.com',
                            role: 'editor',
                            // save should be called when the role was already assigned
                            save: jest.fn().mockImplementation(() => {
                                expect(userToUpdate.role).toBe('readonly');
                            })
                        };

                        jest.spyOn(userService as any, 'IsModificationAuthorized')
                            .mockResolvedValue(userToUpdate);

                        // update with a new email
                        await userService.updateOne(
                            {} as any,
                            'test-id',
                            { email: 'new_test_email@gmail.com' }
                        );

                        expect(userToUpdate.save).toHaveBeenCalled();
                    });

                    test('emailValidated should be updated to false', async () => {
                        // user returned by IsModificationAuthorized function
                        const userToUpdate = {
                            email: 'former_email@gmail.com',
                            emailValidated: true,
                            // save should be called when the emailValidated was already assigned
                            save: jest.fn().mockImplementation(() => {
                                expect(userToUpdate.emailValidated).toBeFalsy();
                            })
                        };

                        jest.spyOn(userService as any, 'IsModificationAuthorized')
                            .mockResolvedValue(userToUpdate);

                        // update with a new email
                        await userService.updateOne(
                            {} as any,
                            'test-id',
                            { email: 'new_test_email@gmail.com' }
                        );

                        expect(userToUpdate.save).toHaveBeenCalled();
                    });
                });

                describe('New email is the same', () => {
                    test('role should not change', async () => {
                        // user returned by IsModificationAuthorized function
                        const userToUpdate = {
                            email: 'former_email@gmail.com',
                            role: 'editor',
                            // save should be called when the role was already assigned
                            save: jest.fn().mockImplementation(() => {
                                expect(userToUpdate.role).toBe('editor');
                            })
                        };

                        jest.spyOn(userService as any, 'IsModificationAuthorized')
                            .mockResolvedValue(userToUpdate);

                        // update with the same email
                        await userService.updateOne(
                            {} as any,
                            'test-id',
                            { email: userToUpdate.email }
                        );

                        expect(userToUpdate.save).toHaveBeenCalled();
                    });

                    test('emailValidated should not change', async () => {
                        // user returned by IsModificationAuthorized function
                        const userToUpdate = {
                            email: 'former_email@gmail.com',
                            emailValidated: true,
                            // save should be called when the emailValidated was already assigned
                            save: jest.fn().mockImplementation(() => {
                                expect(userToUpdate.emailValidated).toBeTruthy();
                            })
                        };

                        jest.spyOn(userService as any, 'IsModificationAuthorized')
                            .mockResolvedValue(userToUpdate);

                        // update with the same email
                        await userService.updateOne(
                            {} as any,
                            'test-id',
                            { email: userToUpdate.email }
                        );

                        expect(userToUpdate.save).toHaveBeenCalled();
                    });
                });
            });
        });

        describe('Process success', () => {
            test('should return the updated user', async () => {
                // user returned by IsModificationAuthorized function
                const userToUpdate = {
                    save: jest.fn(),
                };

                jest.spyOn(userService as any, 'IsModificationAuthorized')
                    .mockResolvedValue(userToUpdate);

                // update with the same email
                const result = await userService.updateOne(
                    {} as any,
                    'test-id',
                    { password: '12345' }
                );

                expect(result).toStrictEqual(userToUpdate);
            });
        });
    });

    describe('IsModificationAuthorized', () => {
        describe('Administrators', () => {
            test('admin should be authorized to modify any non-admin users', async () => {
                const userToModify = {
                    role: Math.round(Math.random()) ? 'readonly' : 'editor',
                    id: faker.food.fruit(),
                };

                const requestUser = {
                    id: faker.food.fruit(),
                    role: 'admin'
                } as const;

                const userServiceFindOneMock = jest.spyOn(userService, 'findOne')
                    .mockResolvedValue(userToModify as any);

                const result = await userService['IsModificationAuthorized'](requestUser, userToModify.id);

                expect(userServiceFindOneMock).toHaveBeenCalled();
                // the user to modify returned indicates the user is authorized 
                // to perform this action
                expect(result).toStrictEqual(userToModify);
            });

            test('should be not authorized to modify other admins', async () => {
                const userToModify = {
                    role: 'admin',
                    id: faker.food.fruit(),
                };

                const requestUser = {
                    id: faker.food.fruit(),
                    role: 'admin'
                } as const;

                const userServiceFindOneMock = jest.spyOn(userService, 'findOne')
                    .mockResolvedValue(userToModify as any);

                const result = await userService['IsModificationAuthorized'](requestUser, userToModify.id);

                expect(userServiceFindOneMock).toHaveBeenCalled();
                // null indicates the user not is authorized to perform this action
                expect(result).toBeNull()
            });

            test('should be authorized to modify themselves', async () => {
                const userID = faker.food.fruit();
                const userToModify = {
                    role: 'admin',
                    id: userID,
                };

                const requestUser = {
                    id: userID,
                    role: 'admin'
                } as const;

                const userServiceFindOneMock = jest.spyOn(userService, 'findOne')
                    .mockResolvedValue(userToModify as any);

                const result = await userService['IsModificationAuthorized'](requestUser, userToModify.id);

                expect(userServiceFindOneMock).toHaveBeenCalled();
                // the user to modify returned indicates the user is authorized 
                // to perform this action
                expect(result).toStrictEqual(userToModify);
            });
        });

        describe('Editors', () => {
            test('should be not authorized to modify other users', async () => {
                const userToModify = {
                    role: Math.round(Math.random()) ? 'readonly' : 'editor',
                    id: faker.food.fruit(),
                };

                const requestUser = {
                    id: faker.food.fruit(),
                    role: 'editor'
                } as const;

                const userServiceFindOneMock = jest.spyOn(userService, 'findOne')
                    .mockResolvedValue(userToModify as any);

                const result = await userService['IsModificationAuthorized'](requestUser, userToModify.id);

                expect(userServiceFindOneMock).toHaveBeenCalled();
                // null indicates the user not is authorized to perform this action
                expect(result).toBeNull()
            });

            test('should be authorized to modify themselves', async () => {
                const userID = faker.food.fruit();
                const userToModify = {
                    role: 'editor',
                    id: userID,
                };

                const requestUser = {
                    id: userID,
                    role: 'editor'
                } as const;

                const userServiceFindOneMock = jest.spyOn(userService, 'findOne')
                    .mockResolvedValue(userToModify as any);

                const result = await userService['IsModificationAuthorized'](requestUser, userToModify.id);

                expect(userServiceFindOneMock).toHaveBeenCalled();
                // the user to modify returned indicates the user is authorized 
                // to perform this action
                expect(result).toStrictEqual(userToModify);
            });
        });

        describe('Readonlys', () => {
            test('should be not authorized to modify other users', async () => {
                const userToModify = {
                    role: Math.round(Math.random()) ? 'readonly' : 'editor',
                    id: 'test-user-id',
                };

                const requestUser = {
                    id: 'test-request-user-id',
                    role: 'readonly'
                } as const;

                const userServiceFindOneMock = jest.spyOn(userService, 'findOne')
                    .mockResolvedValue(userToModify as any);

                const result = await userService['IsModificationAuthorized'](requestUser, userToModify.id);

                expect(userServiceFindOneMock).toHaveBeenCalled();
                // null indicates the user not is authorized to perform this action
                expect(result).toBeNull()
            });

            test('should be authorized to modify themselves', async () => {
                const userID = faker.food.fruit();
                const userToModify = {
                    role: 'readonly',
                    id: userID,
                };

                const requestUser = {
                    id: userID,
                    role: 'readonly'
                } as const;

                const userServiceFindOneMock = jest.spyOn(userService, 'findOne')
                    .mockResolvedValue(userToModify as any);

                const result = await userService['IsModificationAuthorized'](requestUser, userToModify.id);

                expect(userServiceFindOneMock).toHaveBeenCalled();
                // the user to modify returned indicates the user is authorized 
                // to perform this action
                expect(result).toStrictEqual(userToModify);
            });
        });
    });
});