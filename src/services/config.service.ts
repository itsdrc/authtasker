import "dotenv/config";
import * as env from "env-var";
import { SystemLoggerService } from "./system-logger.service";

export class ConfigService {
    public readonly NODE_ENV: string;
    public readonly MONGO_URI: string;
    public readonly PORT: number;
    public readonly BCRYPT_SALT_ROUNDS: number;
    public readonly JWT_EXPIRATION_TIME: string;
    public readonly JWT_PRIVATE_KEY: string;
    private readonly MAIL_SERVICE: boolean; // private, use mailServiceIsDefined() instead
    public readonly MAIL_SERVICE_HOST: string | undefined;
    public readonly MAIL_SERVICE_PORT: number | undefined;
    public readonly MAIL_SERVICE_USER: string | undefined;
    public readonly MAIL_SERVICE_PASS: string | undefined;
    public readonly WEB_URL: string;
    public readonly HTTP_LOGS: boolean;
    public readonly REDIS_PORT: number;
    public readonly REDIS_HOST: string;
    public readonly REDIS_PASSWORD: string;
    public readonly ADMIN_NAME: string;
    public readonly ADMIN_EMAIL: string;
    public readonly ADMIN_PASSWORD: string;

    constructor() {

        this.NODE_ENV = env.get('NODE_ENV')
            .required()
            .asEnum(['development', 'e2e', 'integration'])

        this.HTTP_LOGS = env.get('HTTP_LOGS')
            .default("true")
            .asBool();

        this.MONGO_URI = env.get('MONGO_URI')
            .required()
            .asUrlString();

        this.PORT = env.get('PORT')
            .default(3000)
            .asPortNumber();

        this.BCRYPT_SALT_ROUNDS = env.get('BCRYPT_SALT_ROUNDS')
            .default(10)
            .asInt();

        this.JWT_EXPIRATION_TIME = env.get('JWT_EXPIRATION_TIME')
            .required()
            .asString();

        this.JWT_PRIVATE_KEY = env.get('JWT_PRIVATE_KEY')
            .required()
            .asString();

        this.MAIL_SERVICE = env.get('MAIL_SERVICE')
            .required()
            .asBool();

        if (this.MAIL_SERVICE) {
            this.MAIL_SERVICE_HOST = env.get('MAIL_SERVICE_HOST')
                .required()
                .asString();

            this.MAIL_SERVICE_PORT = env.get('MAIL_SERVICE_PORT')
                .required()
                .asPortNumber();

            this.MAIL_SERVICE_USER = env.get('MAIL_SERVICE_USER')
                .required()
                .asString();

            this.MAIL_SERVICE_PASS = env.get('MAIL_SERVICE_PASS')
                .required()
                .asString();
        }

        this.WEB_URL = env.get('WEB_URL')
            .required()
            .asUrlString();

        this.REDIS_PORT = env.get('REDIS_PORT')
            .default(6379)
            .asPortNumber();

        this.REDIS_HOST = env.get('REDIS_HOST')
            .default('127.0.0.1')
            .asString();

        this.REDIS_PASSWORD = env.get('REDIS_PASSWORD')
            .required()
            .asString();

        this.ADMIN_NAME = env.get('ADMIN_NAME')
            .required()
            .asString();

        this.ADMIN_EMAIL = env.get('ADMIN_EMAIL')
            .required()
            .asEmailString();

        this.ADMIN_PASSWORD = env.get('ADMIN_PASSWORD')
            .required()
            .asString();
    }

    mailServiceIsDefined(): this is this & {
        MAIL_SERVICE_HOST: string,
        MAIL_SERVICE_PORT: string,
        MAIL_SERVICE_USER: string,
        MAIL_SERVICE_PASS: string,
    } {
        return this.MAIL_SERVICE === true;
    }
}
