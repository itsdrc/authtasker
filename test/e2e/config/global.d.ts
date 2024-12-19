import { UserDataGenerator } from "@root/seed/generators/user.generator";

declare global {
    var ADMIN_TOKEN: string;
    var REGISTER_USER_PATH: string;
    var LOGIN_USER_PATH: string;
    var USERS_PATH: string;
    var DATA_GENERATOR: UserDataGenerator;
}

export global {};