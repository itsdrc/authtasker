import { AsyncLocalStorage } from "async_hooks";
import { AppRoutes } from "@root/routes/server.routes";
import { ConfigService, HashingService, LoggerService } from "@root/services";
import { MongoDatabase } from "@root/databases/mongo/mongo.database";
import { Server } from "@root/server/server.init";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { UserDataGenerator } from "@root/seed/generators/user.generator";
import * as ModelLoader from "@root/databases/mongo/models/users/user.model.load";

beforeAll(async () => {
    // disable info and warn logs during tests
    jest.spyOn(SystemLoggerService, 'info').mockImplementation();
    jest.spyOn(SystemLoggerService, 'warn').mockImplementation();

    const configService = new ConfigService();
    global.CONFIG_SERVICE = configService;

    // mock to always return the same model (models can not be compiled twice)
    const userModel = ModelLoader.loadUserModel(configService);
    jest.spyOn(ModelLoader, 'loadUserModel').mockImplementation(() => userModel);
    global.USER_MODEL = userModel;

    const connected = await MongoDatabase.connect(configService.MONGO_URI);
    if (!connected)
        throw new Error('can not connect to database');

    // get server
    const asyncLocalStorage = new AsyncLocalStorage<any>();
    const loggerService = new LoggerService(configService, asyncLocalStorage);
    const appRoutes = new AppRoutes(configService, loggerService, asyncLocalStorage);
    const server = new Server(configService.PORT, await appRoutes.buildApp());
    global.SERVER_APP = server['app'];

    // data generator for tests
    const dataGenerator = new UserDataGenerator({ respectMinAndMaxLength: true });
    global.USER_DATA_GENERATOR = dataGenerator;

    // hash passwords when users in tests are created
    const hashingService = new HashingService(configService.BCRYPT_SALT_ROUNDS);
    global.HASHING_SERVICE = hashingService;

    // paths
    global.REGISTER_USER_PATH = `/api/users/create`;
    global.LOGIN_USER_PATH = `/api/users/login`;
    global.USERS_PATH = `/api/users`;
});

afterAll(async () => {
    await MongoDatabase.disconnect();
})