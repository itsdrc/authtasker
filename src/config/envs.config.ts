import "dotenv/config";
import * as env from "env-var";

export const ENVS = {
    MONGO_URI: env.get('MONGO_URI')
        .required()
        .asUrlString(),
    PORT: env.get('PORT')
        .default(3000)
        .asPortNumber(),
    BCRYPT_SALT_ROUNDS: env.get('BCRYPT_SALT_ROUNDS')
        .default(10)
        .asInt(),
    JWT_EXPIRATION_TIME: env.get('JWT_EXPIRATION_TIME')
        .required()
        .asString(),
    JWT_PRIVATE_KEY: env.get('JWT_PRIVATE_KEY')
        .required()
        .asString(),
}