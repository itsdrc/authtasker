import { IUser } from "@root/interfaces/user/user.interface";
import { Server } from "@root/server/server.init";
import { ConfigService } from "@root/services/config.service";
import { Model } from "mongoose";
import {Express} from 'express';
import { UserDataGenerator } from "@root/seed/generators/user.generator";
import { HashingService } from "@root/services";

declare global {
    var USER_MODEL: Model<IUser>;
    var SERVER_APP: Express;
    var USER_DATA_GENERATOR: UserDataGenerator;    
    var CONFIG_SERVICE: ConfigService;
    var HASHING_SERVICE: HashingService;
}

export global {};