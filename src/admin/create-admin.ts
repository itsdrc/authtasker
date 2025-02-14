import { Model } from "mongoose";
import { IUser } from "@root/interfaces";
import { ConfigService, HashingService, SystemLoggerService } from "@root/services";

export const createAdmin = async (
    userModel: Model<IUser>,
    configService: ConfigService,
    hashingService: HashingService
) => {
    try {
        const alreadyExists = await userModel.findOne({ name: configService.ADMIN_NAME }).exec();
        if (!alreadyExists) {
            const { id } = await userModel.create({
                name: configService.ADMIN_NAME,
                email: configService.ADMIN_EMAIL,
                password: await hashingService.hash(configService.ADMIN_PASSWORD),
                role: 'admin',
                emailValidated: true
            });
            SystemLoggerService.info(`Admin ${id} created successfully`);
        } else {
            SystemLoggerService.info(`Admin user creation omitted, already exists`);
        }
    } catch (error) {                
        SystemLoggerService.error(`Failed to create admin user: ${error}`);
        process.exit(1);
    }
}