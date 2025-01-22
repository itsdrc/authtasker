import { CreateTaskValidator } from "@root/rules/validators/models/tasks/create-task.validator";
import { LoggerService } from "./logger.service";
import { HydratedDocument, Model, Types } from "mongoose";
import { ITasks } from "@root/interfaces/tasks/task.interface";
import { HttpError } from "@root/rules/errors/http.error";

export class TasksService {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly tasksModel: Model<ITasks>
    ) {}

    private handlePossibleDuplicatedKeyError(error: any): never {
        if (error.code && error.code === 11000) {
            const duplicatedKey = Object.keys(error.keyValue);
            const keyValue = Object.values(error.keyValue);
            const message = `Task with ${duplicatedKey} "${keyValue}" already exists`;
            this.loggerService.error(message);
            throw HttpError.badRequest(message);
        } else {
            // rethrowing        
            throw error;
        }
    }

    async create(task: CreateTaskValidator, user: string): Promise<HydratedDocument<ITasks>> {
        try {
            const taskCreated = await this.tasksModel.create({
                ...task,
                user,
            });
            return taskCreated;
        } catch (error) {
            this.handlePossibleDuplicatedKeyError(error);
        }
    }
}