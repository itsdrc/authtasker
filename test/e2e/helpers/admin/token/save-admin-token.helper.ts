import { SystemLoggerService } from "@root/services/system-logger.service";
import { writeFileSync } from "fs";

export const saveAdminToken = (token: string) => {
    const path = `${__dirname}/admin-token.txt`;
    writeFileSync(path, token);
    SystemLoggerService.info('Admin token obtained and saved');
};