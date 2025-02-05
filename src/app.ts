import { AsyncLocalStorage } from "async_hooks";
import { ConfigService } from "./services/config.service";
import { MongoDatabase } from "./databases/mongo/mongo.database";
import { Server } from "./server/server.init";
import { SystemLoggerService } from "./services/system-logger.service";
import { LoggerService } from "./services/logger.service";
import { IAsyncLocalStorageStore } from "./interfaces/common/async-local-storage.interface";
import { RedisService } from "./services";
import { AppRoutes } from "./routes/server.routes";
import { ApplicationEvents } from "./events/application.events";

async function main() {
    process.on('unhandledRejection', (reason, promise) => {
        SystemLoggerService.error(`Unhandled rejection: ${reason}`);
    });

    const configService = new ConfigService();
    SystemLoggerService.info(`Starting application in ${configService.NODE_ENV} MODE`);

    const asyncLocalStorage = new AsyncLocalStorage<IAsyncLocalStorageStore>();
    const loggerService = new LoggerService(configService, asyncLocalStorage);

    // mongo connection
    const mongoDatabase = new MongoDatabase(
        configService,
        loggerService
    );
    await mongoDatabase.connect();

    // redis connection
    const redisService = new RedisService(configService);
    await redisService.connect();

    // server connection
    const server = new Server(
        configService.PORT,
        await new AppRoutes(
            configService,
            loggerService,
            asyncLocalStorage,
            redisService
        ).buildApp()
    );
    server.start();

    ApplicationEvents.resumeApplication(async () => {
        await server.start();
    });

    ApplicationEvents.closeApplication(async () => {
        await server.close();
    });
}

main();