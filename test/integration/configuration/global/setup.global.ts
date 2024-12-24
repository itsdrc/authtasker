import { ConfigService } from "@root/services";
import { SystemLoggerService } from "@root/services/system-logger.service";

export default async () => {
    const configService = new ConfigService();
    SystemLoggerService.info('Integration global setup');

    if (configService.NODE_ENV !== 'integration') {
        SystemLoggerService.error('integration mode is not enabled');
        process.exit(1);
    }

    if (configService.mailServiceIsDefined()) {
        SystemLoggerService.error('do not enable email service on integration mode');
        process.exit(1);
    }
}