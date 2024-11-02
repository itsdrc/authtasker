import { ENVS } from "./config/envs.config";
import { MongoDatabase } from "./databases/mongo/mongo.database";
import { AppRoutes } from "./routes/server.routes";
import { Server } from "./server/server.init";

async function main() {    
    await MongoDatabase.connect(ENVS.MONGO_URI);
    const server = new Server(ENVS.PORT,AppRoutes.routes,);
    server.start();
}

main();