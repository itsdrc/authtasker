import axios from 'axios';
import { SystemLoggerService } from "@root/services/system-logger.service";
import { writeFileSync } from 'fs';

export default async () => {
    SystemLoggerService.info('E2E global setup');

    if (process.env.NODE_ENV !== 'e2e') {
        SystemLoggerService.error('e2e mode is not enabled');
        process.exit(1);
    }
    
    try {
        const response = await axios.post(`${process.env.WEB_URL}/api/users/login`, {
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
        });

        const adminToken = response.data.token;

        writeFileSync(`${__dirname}/token.txt`, adminToken);        
        SystemLoggerService.info('Admin token obtained');

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}