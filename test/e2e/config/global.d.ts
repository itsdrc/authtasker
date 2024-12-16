import { IUser } from "@root/interfaces/user/user.interface";
import { ConfigService } from "@root/services/config.service";
import { Model } from "mongoose";

declare global {
    var CONFIG_SERVICE: ConfigService;
    var USER_MODEL: Model<IUser>;
    var ADMIN_TOKEN: string;
    var CREATE_USER_PATH: string;
    var LOGIN_USER_PATH: string;
    var DELETE_USER_PATH: string;
}

export {};