import axios from "axios";
import { createAdmin } from "@root/admin/create-admin";
import { MongoDatabase } from "@root/databases/mongo/mongo.database";
import { ConfigService } from "@root/services/config.service";
import { HashingService } from "@root/services/hashing.service";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { loadUserModel } from "@root/databases/mongo/models/users/user.model.load";
import { handleAxiosError } from "../helpers/handlers/axios-error.handler";

export default async () => {
    SystemLoggerService.info('E2E Setup');

    const configService = new ConfigService();

    if (configService.NODE_ENV !== 'e2e') {
        SystemLoggerService.error('e2e mode is not enabled');
        process.exit(1);
    }    

    await MongoDatabase.connect(configService.MONGO_URI);
    const userModel = loadUserModel(configService);    

    await createAdmin(
        userModel,
        configService,
        new HashingService(configService.BCRYPT_SALT_ROUNDS)
    );

    const loginPath = `${configService.WEB_URL}api/users/login`;

    let adminToken;
    try {
        const res = await axios.post(loginPath, {
            email: configService.ADMIN_EMAIL,
            password: configService.ADMIN_PASSWORD,
        });        
        adminToken = res.data.token;

    } catch (error) {
        handleAxiosError(error);
    }

    // set test globals
    global.CONFIG_SERVICE = configService;
    global.USER_MODEL = userModel;
    global.ADMIN_TOKEN = adminToken;
    global.CREATE_USER_PATH = `${configService.WEB_URL}api/users/create`;
    global.LOGIN_USER_PATH = `${configService.WEB_URL}api/users/login`;
    global.DELETE_USER_PATH = `${configService.WEB_URL}api/users`;
}