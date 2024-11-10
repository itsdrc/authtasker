import "dotenv/config";
import * as env from "env-var";

export class ConfigService {

    public readonly NODE_ENV = env.get('NODE_ENV')
        .required()
        .asEnum(['development', 'testing', 'production'])

    public readonly MONGO_URI = env.get('MONGO_URI')
        .required()
        .asUrlString();

    public readonly PORT = env.get('PORT')
        .default(3000)
        .asPortNumber();

    public readonly BCRYPT_SALT_ROUNDS = env.get('BCRYPT_SALT_ROUNDS')
        .default(10)
        .asInt();

    public readonly JWT_EXPIRATION_TIME = env.get('JWT_EXPIRATION_TIME')
        .required()
        .asString();

    public readonly JWT_PRIVATE_KEY = env.get('JWT_PRIVATE_KEY')
        .required()
        .asString();

    public readonly MAIL_SERVICE_HOST = env.get('MAIL_SERVICE_HOST')
        .required()
        .asString();

    public readonly MAIL_SERVICE_PORT = env.get('MAIL_SERVICE_PORT')
        .required()
        .asPortNumber();

    public readonly MAIL_SERVICE_USER = env.get('MAIL_SERVICE_USER')
        .required()
        .asString();

    public readonly MAIL_SERVICE_PASS = env.get('MAIL_SERVICE_PASS')
        .required()
        .asString();

    public readonly WEB_URL = env.get('WEB_URL')
        .required()
        .asUrlString();

    public readonly MAIL_SERVICE = env.get('MAIL_SERVICE')
        .required()
        .asBool()
}
