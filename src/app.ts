import { AsyncLocalStorage } from "async_hooks";
import { ConfigService } from "./services/config.service";
import { MongoDatabase } from "./databases/mongo/mongo.database";
import { Server } from "./server/server.init";
import { SystemLoggerService } from "./services/system-logger.service";
import { MongooseEventsListener } from "./events/mongoose.events";
import { LoggerService } from "./services/logger.service";
import { IAsyncLocalStorageStore } from "./interfaces/common/async-local-storage.interface";
import { RedisService } from "./services";

async function main() {
    process.on('unhandledRejection', (reason, promise) => {
        SystemLoggerService.error(`Unhandled Rejection at: ${reason}, Promise ${promise}`);
    });

    process.on('uncaughtException', (error) => {    
        SystemLoggerService.error(`Uncaught Exception thrown: ${error.message}`);
        process.exit(1);
    });

    const configService = new ConfigService();
    SystemLoggerService.info(`Starting application in ${configService.NODE_ENV} MODE`);

    const asyncLocalStorage = new AsyncLocalStorage<IAsyncLocalStorageStore>();
    const loggerService = new LoggerService(configService, asyncLocalStorage);

    new MongooseEventsListener(loggerService);

    const connected = await MongoDatabase.connect(configService.MONGO_URI)
    if (connected) {
        // Allows the models to be loaded only if db is connected.
        const { AppRoutes } = await import('./routes/server.routes');

        const redisService = new RedisService(configService);
        const appRoutes = new AppRoutes(
            configService,
            loggerService,
            asyncLocalStorage,
            redisService
        );
        const server = new Server(configService.PORT, await appRoutes.buildApp());
        server.start();
    }
}

main();