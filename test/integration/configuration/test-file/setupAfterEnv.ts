import { AsyncLocalStorage } from "async_hooks";
import { AppRoutes } from "@root/routes/server.routes";
import { ConfigService, HashingService, LoggerService, RedisService } from "@root/services";
import { MongoDatabase } from "@root/databases/mongo/mongo.database";
import { Server } from "@root/server/server.init";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { UserDataGenerator } from "@root/seed/generators/user.generator";
import { TasksDataGenerator } from "@root/seed/generators/tasks.generator";
import * as UserModelLoader from "@root/databases/mongo/models/user.model.load";
import * as TasksModelLoader from "@root/databases/mongo/models/tasks.model.load";

let redisService: RedisService;
let mongoDatabase: MongoDatabase;

beforeAll(async () => {
    // disable info and warn logs during tests
    jest.spyOn(SystemLoggerService, 'info').mockImplementation();
    jest.spyOn(SystemLoggerService, 'warn').mockImplementation();

    const configService = new ConfigService();
    global.CONFIG_SERVICE = configService;

    // mock to always return the same model (models can not be compiled twice)
    const userModel = UserModelLoader.loadUserModel(configService);
    jest.spyOn(UserModelLoader, 'loadUserModel')
        .mockImplementation(() => userModel);
    global.USER_MODEL = userModel;

    const tasksModel = TasksModelLoader.loadTasksModel(configService);
    jest.spyOn(TasksModelLoader, 'loadTasksModel')
        .mockImplementation(() => tasksModel);
    global.TASKS_MODEL = tasksModel;

    mongoDatabase = new MongoDatabase(configService, null as any);
    await mongoDatabase.connect();

    // get server
    const asyncLocalStorage = new AsyncLocalStorage<any>();
    const loggerService = new LoggerService(configService, asyncLocalStorage);
    redisService = new RedisService(configService);
    const appRoutes = new AppRoutes(
        configService,
        loggerService,
        asyncLocalStorage,
        redisService,
    );
    const server = new Server(configService.PORT, await appRoutes.buildApp());
    global.SERVER_APP = server['app'];

    // data generator for tests
    const dataGenerator = new UserDataGenerator();
    global.USER_DATA_GENERATOR = dataGenerator;

    const tasksDataGenerator = new TasksDataGenerator();
    global.TASKS_DATA_GENERATOR = tasksDataGenerator;

    // hash passwords when users in tests are created
    const hashingService = new HashingService(configService.BCRYPT_SALT_ROUNDS);
    global.HASHING_SERVICE = hashingService;

    // paths
    global.REGISTER_USER_PATH = `/api/users/create`;
    global.LOGIN_USER_PATH = `/api/users/login`;
    global.USERS_PATH = `/api/users`;
    global.CREATE_TASK_PATH = '/api/tasks/create';
    global.TASKS_PATH = '/api/tasks/';
});

afterAll(async () => {
    await mongoDatabase.disconnect();
    await redisService.disconnect();
})