import { Model, Query } from "mongoose";
import { mock, MockProxy } from 'jest-mock-extended';
import { IUser } from "@root/interfaces/user/user.interface";
import { ConfigService, EmailService, HashingService, JwtBlackListService, JwtService, LoggerService, UserService } from "@root/services";
import { NoReadonly } from "../helpers/types/no-readonly.type";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { FindMockQuery } from "../helpers/types/find-mock-query.type";
import { faker } from "@faker-js/faker/.";
import { TOKEN_PURPOSES } from "@root/rules/constants/token-purposes.constants";
import { ITasks } from "@root/interfaces/tasks/task.interface";

describe('User Service', () => {
    let configService: MockProxy<NoReadonly<ConfigService>>;
    let userModel: FindMockQuery<MockProxy<Model<IUser>>>;
    let tasksModel: FindMockQuery<MockProxy<Model<ITasks>>>;
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
        tasksModel = (mock<Model<ITasks>>() as any);
        hashingService = mock<HashingService>();
        jwtService = mock<JwtService>();
        loggerService = mock<LoggerService>();
        emailService = mock<EmailService>();
        jwtBlackListService = mock<JwtBlackListService>();
        userService = new UserService(
            configService as unknown as ConfigService,
            userModel as unknown as Model<IUser>,
            tasksModel as unknown as Model<ITasks>,
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

    describe('blackListToken', () => {
        test('jwtBlacklistService.blacklist should be called with jti and remaining token exp. time', async () => {
            const testJti = 'test-jti';
            const remainingTokenExpirationTime = 60;
            const tokenExpirationTime = Math.floor(Date.now() / 1000) + remainingTokenExpirationTime;

            await userService['blackListToken'](testJti, tokenExpirationTime);

            expect(jwtBlackListService.blacklist)
                .toHaveBeenCalledWith(testJti, remainingTokenExpirationTime);
        });
    });

    describe('generateSessionToken', () => {
        test('should return a token generated with: jwt exp time (envs), user id and a session purpose', () => {
            // mock jwtService.generate return value
            const mockTokenGenerated = 'abc123';
            jwtService.generate.mockReturnValue(mockTokenGenerated);

            const userID = '12345';
            const testTokenExpTime = '1m';
            configService.JWT_SESSION_EXPIRATION_TIME = testTokenExpTime;

            const sessionToken = userService['generateSessionToken'](userID);

            expect(sessionToken).toBe(mockTokenGenerated);
            expect(jwtService.generate).toHaveBeenCalledWith(testTokenExpTime, {
                id: userID,
                purpose: TOKEN_PURPOSES.SESSION
            });
        });
    });

    describe('handlePossibleDuplicatedKeyError', () => {
        describe('Error does not contain a code 11000', () => {
            test('error should be re-thrown', () => {
                const testError = {
                    code: 1000
                };

                expect(() => userService['handlePossibleDuplicatedKeyError'](testError))
                    .toThrow(expect.objectContaining({ code: 1000 }));
            });
        });

        describe('Error does not contain a "code" property', () => {
            test('error should be re-thrown', () => {
                const testError = new Error('test-error');

                expect(() => userService['handlePossibleDuplicatedKeyError'](testError))
                    .toThrow(testError as any);
            });
        });

        describe('Error contains a code 11000', () => {
            test('should throw http bad request error', async () => {
                const duplicatedKeyError = {
                    code: 11000,
                    keyValue: {}
                };

                expect(() => userService['handlePossibleDuplicatedKeyError'](duplicatedKeyError))
                    .toThrow(expect.objectContaining({
                        statusCode: 400,
                    }));
            });
        });
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
                // mock the token generated
                const mockTokenGenerated = '12345';
                jwtService.generate.mockReturnValue(mockTokenGenerated);

                // set a test web url
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

    describe('requestEmailValidation', () => {
        describe('MAIL_SERVICE env is false', () => {
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

        describe('MAIL_SERVICE env is true', () => {
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
    });


});