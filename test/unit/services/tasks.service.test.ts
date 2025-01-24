import { ITasks } from "@root/interfaces/tasks/task.interface";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { TasksService } from "@root/services/tasks.service";
import { mock, MockProxy } from "jest-mock-extended";
import { Model, Query } from "mongoose";
import { FindMockQuery } from "../helpers/types/find-mock-query.type";
import { LoggerService } from "@root/services";

describe('Tasks Service', () => {
    let tasksService: TasksService;
    let tasksModel: FindMockQuery<MockProxy<Model<ITasks>>>;

    beforeAll(() => {
        SystemLoggerService.info = jest.fn();
        SystemLoggerService.error = jest.fn();
        SystemLoggerService.warn = jest.fn();
    });

    beforeEach(() => {
        tasksModel = (mock<Model<ITasks>>() as any);
        tasksService = new TasksService(
            mock<LoggerService>(),
            tasksModel as any,
        );

        // this allows, for example, findOne().exec() to be a mock...
        tasksModel.find.mockReturnValue(mock<Query<any, any>>());
        tasksModel.findOne.mockReturnValue(mock<Query<any, any>>());
        tasksModel.findById.mockReturnValue(mock<Query<any, any>>());
        tasksModel.findByIdAndDelete.mockReturnValue(mock<Query<any, any>>());
        tasksModel.findByIdAndUpdate.mockReturnValue(mock<Query<any, any>>());
    });

    describe('Create', () => {
        describe('task already exists', () => {
            test('should throw bad request exception', async () => {
                tasksModel.create.mockRejectedValue({ code: 11000, keyValue: [] });
                expect(tasksService.create({} as any, 'test user id'))
                    .rejects
                    .toThrow(expect.objectContaining({
                        statusCode: 400
                    }));
            });
        });

        describe('Unexpected error occurs', () => {
            test('should be rethrown', async () => {
                const unexpectedError = new Error('test-error');

                tasksModel.create.mockRejectedValue(unexpectedError);

                expect(tasksService.create({} as any, 'test user id'))
                    .rejects
                    .toThrow(unexpectedError);
            });
        });

        describe('Creation success', () => {
            test('should return the provided task data and the provided user id', async () => {
                // mock return value from tasksModel.create 
                const createdTaskMock = 'task created mock';
                tasksModel.create
                    .mockResolvedValue(createdTaskMock as any);

                const result = await tasksService.create({} as any, 'test user id');

                expect(result).toBe(createdTaskMock);
            });
        });
    });
});