import { UserDataGenerator } from "@root/seed/generators/user.generator";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { readAdminToken } from "../../helpers/admin/token/read-admin-token.helper";
import { TasksDataGenerator } from "@root/seed/generators/tasks.generator";

beforeAll(() => {
    // disable info logs during tests
    jest.spyOn(SystemLoggerService, 'info').mockImplementation();

    const dataGenerator = new UserDataGenerator();
    const tasksDataGenerator = new TasksDataGenerator();

    global.ADMIN_TOKEN = readAdminToken();
    global.REGISTER_USER_PATH = `${process.env.WEB_URL}/api/users/register`;
    global.LOGIN_USER_PATH = `${process.env.WEB_URL}/api/users/login`;
    global.USERS_PATH = `${process.env.WEB_URL}/api/users`;
    global.EMAIL_VALIDATION_PATH = `${process.env.WEB_URL}/api/users/requestEmailValidation`;
    global.DATA_GENERATOR = dataGenerator;
    global.TASKS_DATA_GENERATOR = tasksDataGenerator;
    global.TASKS_PATH = `${process.env.WEB_URL}/api/tasks`;
    global.CREATE_TASK_PATH = `${process.env.WEB_URL}/api/tasks/create`;
});