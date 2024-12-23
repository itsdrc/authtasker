import axios from 'axios';
import { SystemLoggerService } from "@root/services/system-logger.service";
import { writeFileSync } from 'fs';
import { ImapFlow } from 'imapflow';

const connectImapClient = async () => {
    SystemLoggerService.info('Connecting to IMAP client...');
    const imapClient = new ImapFlow({
        connectionTimeout: 10000,
        logger: false,
        host: 'imap.ethereal.email',
        port: 993,
        secure: true,
        socketTimeout: 60000,
        auth: {
            user: process.env.MAIL_SERVICE_USER!,
            pass: process.env.MAIL_SERVICE_PASS,
        }
    });
    await imapClient.connect();    
    SystemLoggerService.info('Connected to IMAP client');
    global.IMAP_CLIENT = imapClient;
};

const getAdminToken = async () => {
    SystemLoggerService.info('Getting admin token...');
    const response = await axios.post(`${process.env.WEB_URL}/api/users/login`, {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
    });
    const adminToken = response.data.token;
    writeFileSync(`${__dirname}/token.txt`, adminToken);
    SystemLoggerService.info('Admin token obtained');
};

export default async () => {
    SystemLoggerService.info('E2E global setup');

    if (process.env.NODE_ENV !== 'e2e') {
        SystemLoggerService.error('e2e mode is not enabled');
        process.exit(1);
    }

    if (!process.env.MAIL_SERVICE) {
        SystemLoggerService.error('Email service is needed');
        process.exit(1);
    }

    try {
        await Promise.all([
            connectImapClient(),
            getAdminToken()
        ]);

    } catch (error) {
        if (global.IMAP_CLIENT)
            await global.IMAP_CLIENT.logout();

        console.error(error);
        process.exit(1);
    }
}