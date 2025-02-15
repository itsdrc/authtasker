import { TasksDataGenerator } from "@root/seed/generators/tasks.generator";
import { UserDataGenerator } from "@root/seed/generators/user.generator";
import { ImapFlow } from "imapflow";

declare global {
    var ADMIN_TOKEN: string;
    var DATA_GENERATOR: UserDataGenerator;
    var TASKS_DATA_GENERATOR: TasksDataGenerator;
    var REGISTER_USER_PATH: string;
    var LOGIN_USER_PATH: string;
    var USERS_PATH: string;
    var TASKS_PATH: string;
    var CREATE_TASK_PATH: string; 
    var EMAIL_VALIDATION_PATH: string;
    var IMAP_CLIENT: ImapFlow;
}

export global {};