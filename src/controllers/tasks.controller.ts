import { Request, Response } from "express";
import { CreateTaskValidator, UpdateTaskValidator } from "@root/rules/validators/models/tasks";
import { getUserInfoOrHandleError } from "./handlers/get-user-info.handler";
import { handleError } from "@root/common/handlers/error.handler";
import { HTTP_STATUS_CODE, PAGINATION_SETTINGS } from "@root/rules/constants";
import { LoggerService, TasksService } from "@root/services";

export class TasksController {

    constructor(
        private readonly tasksService: TasksService,
        private readonly loggerService: LoggerService,
    ) {}

    readonly create = async (req: Request, res: Response): Promise<void> => {
        try {
            this.loggerService.info('Task creation attempt');
            const [error, validatedTask] = await CreateTaskValidator
                .validateAndTransform(req.body);

            if (validatedTask) {
                this.loggerService.info('Data successfully validated');
                const requestUserInfo = getUserInfoOrHandleError(req, res);

                if (requestUserInfo) {
                    const created = await this.tasksService.create(validatedTask, requestUserInfo.id);
                    res.status(HTTP_STATUS_CODE.CREATED).json(created);
                    return;
                }

            } else {
                this.loggerService.error('Data validation failed'); 
                res.status(HTTP_STATUS_CODE.BADREQUEST).json({ error });
                return;
            }

        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }

    readonly findOne = async (req: Request, res: Response): Promise<void> => {
        try {            
            const id = req.params.id;
            this.loggerService.info(`Task ${id} search attempt`);            
            const taskFound = await this.tasksService.findOne(id);
            res.status(HTTP_STATUS_CODE.OK).json(taskFound);
        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }

    readonly findAll = async (req: Request, res: Response): Promise<void> => {
        try {
            this.loggerService.info('Tasks search attempt');
            const limit = (req.query.limit) ? +req.query.limit : PAGINATION_SETTINGS.DEFAULT_LIMIT;
            const page = (req.query.page) ? +req.query.page : PAGINATION_SETTINGS.DEFAULT_PAGE;
            const tasksFound = await this.tasksService.findAll(limit, page);
            res.status(HTTP_STATUS_CODE.OK).json(tasksFound);
        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }

    readonly findAllByUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.id;
            this.loggerService.info(`Tasks by user ${userId} search attempt`);
            const tasksFound = await this.tasksService.findAllByUser(userId);
            res.status(HTTP_STATUS_CODE.OK).json(tasksFound);
        } catch (error) {
            handleError(res, error,this.loggerService);
        }
    }

    readonly deleteOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            this.loggerService.info(`Task ${id} deletion attempt`);
            const requestUserInfo = getUserInfoOrHandleError(req, res);

            if (requestUserInfo) {
                await this.tasksService.deleteOne(requestUserInfo, id);
                res.status(HTTP_STATUS_CODE.NO_CONTENT).end()
                return;
            }

        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }

    readonly updateOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            this.loggerService.info(`Task ${id} update attempt`);
            const [error, validatedTask] = await UpdateTaskValidator
                .validateAndTransform(req.body);

            if (validatedTask) {
                this.loggerService.info('Data successfully validated');
                const requestUserInfo = getUserInfoOrHandleError(req, res);

                if (requestUserInfo) {
                    const updated = await this.tasksService.updateOne(requestUserInfo, id, validatedTask);
                    res.status(HTTP_STATUS_CODE.OK).json(updated);
                    return;
                }

            } else {
                this.loggerService.error('Data validation failed'); 
                res.status(HTTP_STATUS_CODE.BADREQUEST).json({ error });
                return;
            }
        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }
}