import { ConfigService } from "@root/services";
import { SystemLoggerService } from "@root/services/system-logger.service";

export default async () => {
    const configService = new ConfigService();
    global.CONFIG_SERVICE = configService;
    SystemLoggerService.info('Integration global setup');

    if (configService.NODE_ENV !== 'integration') {
        SystemLoggerService.error('integration mode is not enabled');
        process.exit(1);
    }
}