import { TasksController } from "@root/controllers/tasks.controller";
import { LoggerService } from "@root/services";
import { TasksService } from "@root/services/tasks.service";
import { RolesMiddlewares } from "@root/types/middlewares/roles.middlewares.type";
import { Router } from "express";

export class TasksRoutes {

    private readonly tasksController: TasksController;

    constructor(
        private readonly tasksService: TasksService,
        private readonly loggerService: LoggerService,
        private readonly rolesMiddlewares: RolesMiddlewares
    ) {
        this.tasksController = new TasksController(
            this.tasksService,
            this.loggerService
        );
    }

    async build(): Promise<Router> {
        const router = Router();

        router.post('/create', this.rolesMiddlewares.editor, this.tasksController.create);
        router.delete('/:id', this.rolesMiddlewares.editor, this.tasksController.deleteOne);
        router.get('/:id', this.rolesMiddlewares.readonly, this.tasksController.findOne);
        router.get('/', this.rolesMiddlewares.readonly, this.tasksController.findAll);
        router.patch('/:id', this.rolesMiddlewares.editor, this.tasksController.updateOne);

        return router;
    }
}