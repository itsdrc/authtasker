import { AsyncLocalStorage } from "async_hooks";
import { ConfigService } from "./services/config.service";
import { MongoDatabase } from "./databases/mongo/mongo.database";
import { Server } from "./server/server.init";
import { SystemLoggerService } from "./services/system-logger.service";
import { MongooseEventsListener } from "./events/mongoose.events";
import { LoggerService } from "./services/logger.service";
import { IAsyncLocalStorageStore } from "./interfaces/common/async-local-storage.interface";

async function main() {
    const configService = new ConfigService();
    SystemLoggerService.info(`Starting application in ${configService.NODE_ENV} MODE`);

    const asyncLocalStorage = new AsyncLocalStorage<IAsyncLocalStorageStore>();
    const loggerService = new LoggerService(configService, asyncLocalStorage);

    new MongooseEventsListener(loggerService);

    const connected = await MongoDatabase.connect(configService.MONGO_URI)
    if (connected) {
        // Allows the models to be loaded only if db is connected.
        const { AppRoutes } = await import('./routes/server.routes');

        const appRoutes = new AppRoutes(configService, loggerService, asyncLocalStorage);
        const server = new Server(configService.PORT, await appRoutes.buildApp());
        server.start();
    }
}

main();