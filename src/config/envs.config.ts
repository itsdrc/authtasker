import "dotenv/config";
import * as env from "env-var";

export const ENVS = {
    MONGO_URI: env.get('MONGO_URI')
        .required()
        .asUrlString(),
    PORT: env.get('PORT')
        .default(3000)
        .asPortNumber(),
}