import { readFileSync } from "fs";

beforeAll(() => {
    global.ADMIN_TOKEN = readFileSync(`${__dirname}/token.txt`, 'utf-8');
    global.REGISTER_USER_PATH = `${process.env.WEB_URL}/api/users/create`;
    global.LOGIN_USER_PATH = `${process.env.WEB_URL}/api/users/login`;
    global.USERS_PATH = `${process.env.WEB_URL}/api/users`;
});