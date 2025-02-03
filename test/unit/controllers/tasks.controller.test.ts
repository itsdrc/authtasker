import { TasksController } from "@root/controllers/tasks.controller";
import { LoggerService } from "@root/services";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { TasksService } from "@root/services/tasks.service";
import { mock, MockProxy } from "jest-mock-extended";
import { Request, Response } from "express";
import { CreateTaskValidator } from "@root/rules/validators/models/tasks/create-task.validator";
import * as Handlers from "@root/common/handlers/error.handler";
import * as ControllerHelpers from '@root/controllers/handlers/get-user-info.handler';
import { PAGINATION_SETTINGS } from "@root/rules/constants/pagination.constants";
import { UpdateTaskValidator } from "@root/rules/validators/models/tasks/update-task.validator";

describe('Tasks Controller', () => {
    let tasksController: TasksController;
    let tasksService: MockProxy<TasksService>;
    let loggerService: MockProxy<LoggerService>;

    beforeEach(() => {
        loggerService = mock<LoggerService>();
        tasksService = mock<TasksService>();
        tasksController = new TasksController(tasksService, loggerService);

        // disable system logs
        jest.spyOn(SystemLoggerService, 'error').mockImplementation();
        jest.spyOn(SystemLoggerService, 'info').mockImplementation();
        jest.spyOn(SystemLoggerService, 'warn').mockImplementation();
    });

    describe('Create', () => {
        describe('Validation functions throws an error', () => {
            test('handleError helper should be called', async () => {
                // spy handleError helper and disable implementation           
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // mock res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // mock CreateTaskValidator.validateAndTransform to return an error
                const error = new Error('test-error');
                jest.spyOn(CreateTaskValidator, 'validateAndTransform')
                    .mockRejectedValue(error);

                await tasksController.create(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });

        describe('getUserInfoOrHandleError returns undefined (can not get user data)', () => {
            test('service function "create" should not be called', async () => {
                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // stub CreateTaskValidator.validateAndTransform to return a valid object
                jest.spyOn(CreateTaskValidator, 'validateAndTransform')
                    .mockResolvedValue([undefined, {} as any]);

                // mock getUserInfoOrHandleError to return undefined
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue(undefined);

                await tasksController.create(requestMock, responseMock);

                expect(tasksService.create).not.toHaveBeenCalled();
            });

            test('should not send a response to client again', async () => {
                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // stub CreateTaskValidator.validateAndTransform to return a valid object
                jest.spyOn(CreateTaskValidator, 'validateAndTransform')
                    .mockResolvedValue([undefined, {} as any]);

                // mock getUserInfoOrHandleError to return undefined
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue(undefined);

                await tasksController.create(requestMock, responseMock);

                expect(responseMock.status).not.toHaveBeenCalled();
                expect(responseMock.json).not.toHaveBeenCalled();
            });
        });

        describe('Incoming properties are not valid', () => {
            test('service function "create" should not be called', async () => {
                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // mock CreateTaskValidator.validateAndTransform to return an error
                jest.spyOn(CreateTaskValidator, 'validateAndTransform')
                    .mockResolvedValue(['test-error', undefined]);

                // stub getUserInfoOrHandleError to return a valid user object
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue({} as any);

                await tasksController.create(requestMock, responseMock);

                expect(tasksService.create).not.toHaveBeenCalled();
            });
        });

        describe('Service function "create" throws an error', () => {
            test('handleError helper should be called', async () => {
                // spy handleError helper and disable implementation           
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // stub CreateTaskValidator.validateAndTransform to return a valid object
                jest.spyOn(CreateTaskValidator, 'validateAndTransform')
                    .mockResolvedValue([undefined, {} as any]);

                // stub getUserInfoOrHandleError to return a valid user object
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue({} as any);

                // mock tasksService.create to throw an error
                const error = new Error('test-error');
                tasksService.create.mockRejectedValue(error);

                await tasksController.create(requestMock, responseMock);

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
                // spy handleError helper and disable implementation           
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // mock tasksService.findOne to throw an error
                const error = new Error('test-error');
                tasksService.findOne.mockRejectedValue(error);

                await tasksController.findOne(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });
    });

    describe('Find all', () => {
        describe('Page and limit are not provided', () => {
            test('service function "findAll" should be called with the default page and limit', async () => {
                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await tasksController.findAll(requestMock, responseMock);

                expect(tasksService.findAll).toHaveBeenCalledWith(
                    PAGINATION_SETTINGS.DEFAULT_LIMIT,
                    PAGINATION_SETTINGS.DEFAULT_PAGE
                );
            });
        });

        describe('Page and limit provided by user', () => {
            test('service function "findAll" should be called with the provided page and limit', async () => {
                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // mock req.query
                requestMock.query = {
                    limit: '10',
                    page: '2',
                };

                await tasksController.findAll(requestMock, responseMock);

                expect(tasksService.findAll).toHaveBeenCalledWith(10, 2);
            });
        });

        describe('Service function findAll throws an error', () => {
            test('handleError helper should be called', async () => {
                // spy handleError helper and disable implementation           
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // mock tasksService.findAll to throw an error
                const error = new Error('test-error');
                tasksService.findAll.mockRejectedValue(error);

                await tasksController.findAll(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });
    });

    describe('Find all by user', () => {
        describe('Service function "findAllByUser" throws an error', () => {
            test('handleError helper should be called', async () => {
                // spy handleError helper and disable implementation           
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // mock tasksService.findAllByUser to throw an error
                const error = new Error('test-error');
                tasksService.findAllByUser.mockRejectedValue(error);

                await tasksController.findAllByUser(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });
    });

    describe('Delete one', () => {
        describe('getUserInfoOrHandleError returns undefined (can not get user data)', () => {
            test('service function "deleteOne" should not be called', async () => {
                // mock getUserInfoOrHandleError to return undefined
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue(undefined);

                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await tasksController.deleteOne(requestMock, responseMock);

                expect(tasksService.deleteOne).not.toHaveBeenCalled();
            });

            test('should not send a response to client again', async () => {
                // mock getUserInfoOrHandleError to return undefined
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue(undefined);

                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                await tasksController.deleteOne(requestMock, responseMock);

                expect(responseMock.status).not.toHaveBeenCalled();
                expect(responseMock.json).not.toHaveBeenCalled();
            });
        });
    });

    describe('Update one', () => {
        describe('Validation function throws an error', () => {
            test('handleError helper should be called', async () => {
                // spy handleError helper and disable implementation           
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // mock UpdateTaskValidator.validateAndTransform to throw an error
                const error = new Error('test-error');
                jest.spyOn(UpdateTaskValidator, 'validateAndTransform')
                    .mockRejectedValue(error);

                await tasksController.updateOne(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });

        describe('Incoming properties are not valid', () => {
            test('service function "updateOne" should not be called', async () => {
                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // mock UpdateTaskValidator.validateAndTransform to return an error
                jest.spyOn(UpdateTaskValidator, 'validateAndTransform')
                    .mockResolvedValue(['test-error', undefined]);

                await tasksController.updateOne(requestMock, responseMock);

                expect(tasksService.updateOne).not.toHaveBeenCalled();
            });
        });

        describe('getUserInfoOrHandleError returns undefined (can not get user data)', () => {
            test('service function "updateOne" should not be called', async () => {
                // mock getUserInfoOrHandleError to return undefined
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue(undefined);

                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // stub UpdateTaskValidator.validateAndTransform to return a valid object
                jest.spyOn(UpdateTaskValidator, 'validateAndTransform')
                    .mockResolvedValue([undefined, {} as any]);

                await tasksController.updateOne(requestMock, responseMock);

                expect(tasksService.updateOne).not.toHaveBeenCalled();
            });

            test('should not send a response to client again', async () => {
                // mock getUserInfoOrHandleError to return undefined
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue(undefined);

                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // stub UpdateTaskValidator.validateAndTransform to return a valid object
                jest.spyOn(UpdateTaskValidator, 'validateAndTransform')
                    .mockResolvedValue([undefined, {} as any]);

                await tasksController.updateOne(requestMock, responseMock);

                expect(responseMock.status).not.toHaveBeenCalled();
                expect(responseMock.json).not.toHaveBeenCalled();
            });
        });

        describe('Service function "updateOne" throws an error', () => {
            test('handleError helper should be called', async () => {
                // spy handleError helper and disable implementation           
                const handleErrorSpy = jest.spyOn(Handlers, 'handleError')
                    .mockImplementation();

                // stub res.status(..).json()
                const requestMock = mock<Request>();
                const responseMock = mock<Response>();
                responseMock.status.mockReturnThis();

                // stub UpdateTaskValidator.validateAndTransform to return a valid object
                jest.spyOn(UpdateTaskValidator, 'validateAndTransform')
                    .mockResolvedValue([undefined, {} as any]);

                // stub getUserInfoOrHandleError to return a valid user object
                jest.spyOn(ControllerHelpers, 'getUserInfoOrHandleError')
                    .mockReturnValue({} as any);

                // mock tasksService.updateOne to throw an error
                const error = new Error('test-error');
                tasksService.updateOne.mockRejectedValue(error);

                await tasksController.updateOne(requestMock, responseMock);

                expect(handleErrorSpy).toHaveBeenCalledWith(
                    responseMock,
                    error,
                    loggerService,
                );
            });
        });
    });
});