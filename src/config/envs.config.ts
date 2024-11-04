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
    MAIL_SERVICE_HOST: env.get('MAIL_SERVICE_HOST')
        .required()
        .asString(),
    MAIL_SERVICE_PORT: env.get('MAIL_SERVICE_PORT')
        .required()
        .asPortNumber(),
    MAIL_SERVICE_USER: env.get('MAIL_SERVICE_USER')
        .required()
        .asString(),
    MAIL_SERVICE_PASS: env.get('MAIL_SERVICE_PASS')
        .required()
        .asString(),
}