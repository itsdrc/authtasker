import "dotenv/config";
import * as env from "env-var";

export const ENVS = {
    MONGO_URI: env.get('MONGO_URI')
        .required()
        .asUrlString(),
}