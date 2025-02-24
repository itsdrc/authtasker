import { Router } from "express";
import { LoggerService, SystemLoggerService, TasksService } from "@root/services";
import { RequestLimiterMiddlewares, RolesMiddlewares } from "@root/types/middlewares";
import { TasksController } from "@root/controllers";

export class TasksRoutes {

    private readonly tasksController: TasksController;

    constructor(
        private readonly tasksService: TasksService,
        private readonly loggerService: LoggerService,
        private readonly rolesMiddlewares: RolesMiddlewares,
        private readonly requestLimiterMiddlewares: RequestLimiterMiddlewares,
    ) {
        this.tasksController = new TasksController(
            this.tasksService,
            this.loggerService
        );

        SystemLoggerService.info('Task routes loaded');
    }

    async build(): Promise<Router> {
        const router = Router();
        router.use(this.requestLimiterMiddlewares.apiLimiter);

        router.post(
            '/create',
            this.rolesMiddlewares.editor,
            this.tasksController.create
        );

        router.delete(
            '/:id',
            this.rolesMiddlewares.editor,
            this.tasksController.deleteOne
        );

        router.get(
            '/:id',
            this.rolesMiddlewares.readonly,
            this.tasksController.findOne
        );

        router.get(
            '/',
            this.rolesMiddlewares.readonly,
            this.tasksController.findAll
        );

        router.get(
            '/allByUser/:id',
            this.rolesMiddlewares.readonly,
            this.tasksController.findAllByUser
        );

        router.patch(
            '/:id',
            this.rolesMiddlewares.editor,
            this.tasksController.updateOne
        );

        return router;
    }
}