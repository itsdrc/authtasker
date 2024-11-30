import { AsyncLocalStorage } from "async_hooks";
import { MongoDatabase } from "./databases/mongo/mongo.database";
import { AppRoutes } from "./routes/server.routes";
import { Server } from "./server/server.init";
import { ConfigService } from "./services/config.service";
import { AsyncLocalStorageStore } from "./types/common/asyncLocalStorage.type";

async function main() {
    const asyncLocalStorage = new AsyncLocalStorage<AsyncLocalStorageStore>();
    const configService = new ConfigService();

    await MongoDatabase.connect(configService.MONGO_URI);

    const appRoutes = new AppRoutes(configService, asyncLocalStorage);
    const server = new Server(configService.PORT, appRoutes.routes);

    server.start();
}

main();