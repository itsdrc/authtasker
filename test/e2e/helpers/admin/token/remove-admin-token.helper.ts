import { SystemLoggerService } from "@root/services/system-logger.service";
import { rmSync } from "fs";
import { fileExistsSync } from "tsconfig-paths/lib/filesystem";

export const removeAdminTokenIfExists = () => {
    const tokenPath = `${__dirname}/admin-token.txt`;
    if (fileExistsSync(tokenPath)) {
        rmSync(tokenPath);
        SystemLoggerService.info('Token removed');
    } else {
        SystemLoggerService.info('Token does not exist, nothing to remove');
    }
};