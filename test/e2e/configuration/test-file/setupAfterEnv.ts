import { UserDataGenerator } from "@root/seed/generators/user.generator";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { readFileSync } from "fs";
import { readAdminToken } from "../../helpers/admin/token/read-admin-token.helper";

beforeAll(() => {
    // disable info logs during tests
    jest.spyOn(SystemLoggerService, 'info').mockImplementation();

    const dataGenerator = new UserDataGenerator();

    global.ADMIN_TOKEN = readAdminToken();
    global.REGISTER_USER_PATH = `${process.env.WEB_URL}/api/users/create`;
    global.LOGIN_USER_PATH = `${process.env.WEB_URL}/api/users/login`;
    global.USERS_PATH = `${process.env.WEB_URL}/api/users`;
    global.EMAIL_VALIDATION_PATH = `${process.env.WEB_URL}/api/users/requestEmailValidation`;
    global.DATA_GENERATOR = dataGenerator;
});