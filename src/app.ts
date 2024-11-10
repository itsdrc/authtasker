import { MongoDatabase } from "./databases/mongo/mongo.database";
import { AppRoutes } from "./routes/server.routes";
import { Server } from "./server/server.init";
import { ConfigService } from "./services/config.service";

async function main() {
    const configService = new ConfigService();
    await MongoDatabase.connect(configService.MONGO_URI);
    const appRoutes = new AppRoutes(configService);
    const server = new Server(configService.PORT, appRoutes.routes);

    server.start();
}

main();