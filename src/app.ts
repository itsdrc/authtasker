import { ConfigService } from "./services/config.service";
import { AsyncLocalStorage } from "async_hooks";
import { MongoDatabase } from "./databases/mongo/mongo.database";
import { AppRoutes } from "./routes/server.routes";
import { Server } from "./server/server.init";
import { AsyncLocalStorageStore } from "./types/common/asyncLocalStorage.type";
import { SystemLoggerService } from "./services/system-logger.service";
import { MongooseEventsListener } from "./events/mongoose.events";
import { HttpLoggerService } from "./services/http-logger.service";

async function main() {
    const configService = new ConfigService();
    SystemLoggerService.info(`Starting application in current enviroment: ${configService.NODE_ENV}`);

    const asyncLocalStorage = new AsyncLocalStorage<AsyncLocalStorageStore>();
    const loggerService = new HttpLoggerService(configService, asyncLocalStorage);

    new MongooseEventsListener(loggerService);

    const connected = await MongoDatabase.connect(configService.MONGO_URI)
    if (connected) {
        const appRoutes = new AppRoutes(configService, loggerService, asyncLocalStorage);
        const server = new Server(configService.PORT, appRoutes.routes);
        server.start();
    }
}

main();