import { CreateTaskValidator } from "@root/rules/validators/models/tasks/create-task.validator";
import { LoggerService } from "./logger.service";
import { HydratedDocument, Model, Types } from "mongoose";
import { ITasks } from "@root/interfaces/tasks/task.interface";
import { HttpError } from "@root/rules/errors/http.error";
import { UserRole } from "@root/types/user/user-roles.type";
import { UserService } from "./user.service";
import { FORBIDDEN_MESSAGE } from "@root/rules/errors/messages/error.messages";

export class TasksService {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly tasksModel: Model<ITasks>,
        private readonly userService: UserService,
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

    private async isModificationAuthorized(requestUserInfo: { id: string, role: UserRole }, taskId: string): Promise<HydratedDocument<ITasks> | null> {
        const task = await this.findOne(taskId);

        const taskCreatorId = task.user.toString();
        const taskCreator = await this.userService.findOne(taskCreatorId);

        // administrators can not modify other administrators tasks
        if (requestUserInfo.role === 'admin') {
            return (taskCreator.role === 'admin') ? null : task;
        }

        // modification is allowed if users update their own tasks
        return (requestUserInfo.id === taskCreatorId) ? task : null;
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

    async findOne(id: string) {
        let taskFound;

        if (Types.ObjectId.isValid(id)) {
            taskFound = await this.tasksModel
                .findById(id)
                .exec();
        }

        // id is not valid / task not found
        if (!taskFound)
            throw HttpError.notFound(`Task with id ${id} not found`);

        return taskFound;
    }

    async deleteOne(requestUserInfo: { id: string, role: UserRole }, id: string) {
        const task = await this.isModificationAuthorized(requestUserInfo, id);

        if (!task) {
            this.loggerService.error('User is not authorized to perform this action');
            throw HttpError.forbidden(FORBIDDEN_MESSAGE);
        }

        await task.deleteOne().exec();
        this.loggerService.info(`Task ${id} deleted`);
    }
}