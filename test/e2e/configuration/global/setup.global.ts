import axios from 'axios';
import { SystemLoggerService } from "@root/services/system-logger.service";
import { saveAdminToken } from '../../helpers/admin/token/save-admin-token.helper';
import { removeAdminTokenIfExists } from '../../helpers/admin/token/remove-admin-token.helper';
import { ConfigService } from '@root/services';

export default async () => {
    const configService = new ConfigService();
    SystemLoggerService.info('E2E global setup');

    if (configService.NODE_ENV !== 'e2e') {
        SystemLoggerService.error('e2e mode is not enabled');
        process.exit(1);
    }

    if (!configService.mailServiceIsDefined()) {
        SystemLoggerService.error('Email service is needed');
        process.exit(1);
    }

    try {
        SystemLoggerService.info('Getting admin token...');
        const response = await axios.post(`${configService.WEB_URL}api/users/login`, {
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
        });
        const adminToken = response.data.token;
        saveAdminToken(adminToken);

    } catch (error) {
        removeAdminTokenIfExists();
        console.error(error);
        process.exit(1);
    }
}