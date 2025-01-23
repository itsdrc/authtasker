import { TasksController } from "@root/controllers/tasks.controller";
import { ITasks } from "@root/interfaces/tasks/task.interface";
import { IUser } from "@root/interfaces/user/user.interface";
import { rolesMiddlewareFactory } from "@root/middlewares/roles.middleware";
import { ConfigService, JwtBlackListService, JwtService, LoggerService } from "@root/services";
import { TasksService } from "@root/services/tasks.service";
import { Router } from "express";
import { Model } from "mongoose";

export class TasksRoutes {

    private readonly tasksController: TasksController;
    private readonly tasksService: TasksService;

    constructor(
        private readonly loggerService: LoggerService,
        private readonly configService: ConfigService,
        private readonly tasksModel: Model<ITasks>,
        private readonly userModel: Model<IUser>,
        private readonly jwtService: JwtService,
        private readonly jwtBlacklistService: JwtBlackListService,
    ) {
        this.tasksService = new TasksService(
            loggerService,
            tasksModel
        );

        this.tasksController = new TasksController(
            this.tasksService,
            this.loggerService
        );
    }

    async build(): Promise<Router> {
        const router = Router();

        const editorMiddleware = rolesMiddlewareFactory(
            'editor',
            this.userModel,
            this.loggerService,
            this.jwtService,
            this.jwtBlacklistService,
        );

        const readonlyMiddleware = rolesMiddlewareFactory(
            'readonly',
            this.userModel,
            this.loggerService,
            this.jwtService,
            this.jwtBlacklistService,
        )

        router.post('/create', editorMiddleware, this.tasksController.create);
        router.get('/:id', readonlyMiddleware, this.tasksController.findOne);

        return router;
    }
}